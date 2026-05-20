/**
 * House Builder JavaScript
 * Price Calculator and Interactive Features
 */

jQuery(document).ready(function($) {
  function formatPrice(value) {
    const num = Number(value) || 0;
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      useGrouping: true,
    }).format(num);
  }

  function triggerNativeChange($input) {
    if (!$input || !$input.length) return;
    $input.trigger('change');

    const el = $input.get(0);
    if (el) {
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  function getSelectedSizeValue() {
    return $('input[name="house_size"]:checked').val() || '';
  }

  function parsePrice(value) {
    if (value === undefined || value === null || value === '') return 0;
    return parseFloat(String(value).replace(',', '.')) || 0;
  }

  function getOptionPrice($input) {
    const inputName = $input.attr('name') || '';
    const selectedSize = getSelectedSizeValue();

    const usesPrice200 =
      selectedSize === '60x200' &&
      (
        inputName === 'house_isolation' ||
        inputName === 'house_izolimi_plloqes'
      );

    if (usesPrice200) {
      const price200 = $input.attr('data-price-200');

      if (price200 !== undefined && price200 !== null && String(price200).trim() !== '') {
        return parsePrice(price200);
      }
    }

    return parsePrice($input.attr('data-price'));
  }

  function updatePrice() {
    const perdhesa = window.perdhesaData || {};

    const mureTeJashtme = parsePrice(perdhesa.mure_te_jashtme);
    const pllakaEKulmit = parsePrice(perdhesa.pllaka_e_kulmit);

    const externalWallsM2 = mureTeJashtme;
    const roofM2 = pllakaEKulmit;

    let baseHousePrice = 0;

    let internalInsulationPricePerM2 = 0;
    let externalInsulationPricePerM2 = 0;
    let facadePricePerM2 = 0;
    let roofLayersPricePerM2 = 0;
    let fauxPlafondPricePerM2 = 0;
    let dritaretPrice = 0;
    let etancheitePricePerM2 = 0;
    let toiturePricePerM2 = 0;
    let etancheiteTerrassePricePerM2 = 0;

    const selectedLabels = {
      isolation: '',
      outerIsolation: '',
      facade: '',
      etancheite: '',
      roof: '',
      toiture: '',
      terrasse: '',
      fauxPlafond: '',
      dritaret: ''
    };

    $('input[name="house_size"]:checked').each(function() {
      baseHousePrice = getOptionPrice($(this));
    });

    $('input[name="house_isolation"]:checked').each(function() {
      internalInsulationPricePerM2 += getOptionPrice($(this));
      selectedLabels.isolation = $(this).val() || '';
    });

    $('input[name="house_outer_isolation"]:checked').each(function() {
      externalInsulationPricePerM2 += getOptionPrice($(this));
      selectedLabels.outerIsolation = $(this).val() || '';
    });

    $('input[name="house_facade"]:checked').each(function() {
      facadePricePerM2 += getOptionPrice($(this));
      selectedLabels.facade = $(this).val() || '';
    });

    $('input[name="house_etancheite"]:checked').each(function() {
      etancheitePricePerM2 += getOptionPrice($(this));
      selectedLabels.etancheite = $(this).val() || '';
    });

    $('input[name="house_struktura_plloqes"]:checked').each(function() {
      roofLayersPricePerM2 += getOptionPrice($(this));
      selectedLabels.roof = $(this).val() || '';
    });

    $('input[name="house_toiture"]:checked').each(function() {
      toiturePricePerM2 += getOptionPrice($(this));
      selectedLabels.toiture = $(this).val() || '';
    });

    $('input[name="house_etancheite_terrasse"]:checked').each(function() {
      etancheiteTerrassePricePerM2 += getOptionPrice($(this));
      selectedLabels.terrasse = $(this).val() || '';
    });

    $('input[name="house_izolimi_plloqes"]:checked').each(function() {
      fauxPlafondPricePerM2 += getOptionPrice($(this));
      selectedLabels.fauxPlafond = $(this).val() || '';
    });

    $('input[name="house_dritaret"]:checked').each(function() {
      dritaretPrice += getOptionPrice($(this));
      selectedLabels.dritaret = $(this).val() || '';
    });

    const costSkeleton = baseHousePrice;
    const costInternalInsulation = internalInsulationPricePerM2 * mureTeJashtme;
    const costExternalInsulation = externalInsulationPricePerM2 * externalWallsM2;
    const costFacade = facadePricePerM2 * externalWallsM2;
    const costEtancheite = etancheitePricePerM2 * roofM2;
    const costRoof = roofLayersPricePerM2 * roofM2;
    const costToiture = toiturePricePerM2 * roofM2;
    const costEtancheiteTerrasse = etancheiteTerrassePricePerM2 * roofM2;
    const costFauxPlafond = fauxPlafondPricePerM2 * externalWallsM2;
    const costDritaret = dritaretPrice;

    const grandTotal =
      costSkeleton +
      costInternalInsulation +
      costExternalInsulation +
      costFacade +
      costEtancheite +
      costRoof +
      costToiture +
      costEtancheiteTerrasse +
      costFauxPlafond +
      costDritaret;

    const breakdownItems = [];

    if (costSkeleton > 0) {
      breakdownItems.push({
        label: 'Structure en ossature bois',
        value: costSkeleton
      });
    }

    if (selectedLabels.isolation) {
      breakdownItems.push({
        label: 'Isolation intermédiaire — ' + selectedLabels.isolation,
        value: costInternalInsulation
      });
    }

    if (selectedLabels.outerIsolation) {
      breakdownItems.push({
        label: 'Isolation extérieure — ' + selectedLabels.outerIsolation,
        value: costExternalInsulation
      });
    }

    if (selectedLabels.facade) {
      breakdownItems.push({
        label: 'Revêtement extérieur — ' + selectedLabels.facade,
        value: costFacade
      });
    }

    if (selectedLabels.etancheite) {
      breakdownItems.push({
        label: 'Étanchéité / Pare-pluie — ' + selectedLabels.etancheite,
        value: costEtancheite
      });
    }

    if (selectedLabels.roof) {
      breakdownItems.push({
        label: 'Isolation de la toiture par l’extérieur — ' + selectedLabels.roof,
        value: costRoof
      });
    }

    if (selectedLabels.toiture) {
      breakdownItems.push({
        label: 'Couverture — ' + selectedLabels.toiture,
        value: costToiture
      });
    }

    if (selectedLabels.terrasse) {
      breakdownItems.push({
        label: 'Étanchéité toiture terrasse avec couvertine — ' + selectedLabels.terrasse,
        value: costEtancheiteTerrasse
      });
    }

    if (selectedLabels.fauxPlafond) {
      breakdownItems.push({
        label: 'Faux plafond — ' + selectedLabels.fauxPlafond,
        value: costFauxPlafond
      });
    }

    if (selectedLabels.dritaret) {
      breakdownItems.push({
        label: 'Menuiseries extérieures — ' + selectedLabels.dritaret,
        value: costDritaret
      });
    }

    $('.base-price-value').text(formatPrice(baseHousePrice));
    $('.price-value').text(formatPrice(grandTotal));
    $('.total-price-value').text(formatPrice(grandTotal));

    updateBreakdown(breakdownItems);

    window.priceBreakdown = breakdownItems;
    window.basePrice = baseHousePrice;
    window.grandTotal = grandTotal;
  }

  function updateBreakdown(items) {
    const $breakdownItems = $('#breakdown-items');
    $breakdownItems.empty();

    items.forEach(function(item) {
      const breakdownHtml =
        '<div class="breakdown-item">' +
        '<span class="breakdown-label">' + item.label + '</span>' +
        '<span class="breakdown-value">€ ' + formatPrice(item.value) + '</span>' +
        '</div>';

      $breakdownItems.append(breakdownHtml);
    });
  }

  let lastValidImage = null;
  let imageStack = [];

  function makeKey($input) {
    const name = $input.attr('name') || '';
    const type = ($input.attr('type') || '').toLowerCase();
    const val = $input.val() || '';
    return `${name}|${type}|${val}`;
  }

  function isValidImg(url) {
    if (!url) return false;
    url = String(url).trim();
    if (!url || url === 'undefined' || url === 'null') return false;
    return url.startsWith('http') || url.startsWith('/') || url.startsWith('data:');
  }

  function stackPush(key, url) {
    if (!isValidImg(url)) return;
    imageStack = imageStack.filter(x => x.key !== key);
    imageStack.push({ key, url: String(url).trim() });
  }

  function stackRemove(key) {
    imageStack = imageStack.filter(x => x.key !== key);
  }

  function stackTopUrl() {
    if (!imageStack.length) return null;
    return imageStack[imageStack.length - 1]?.url || null;
  }

  function getDefaultSizeImage() {
    const img = $('input[name="house_size"]:checked').data('image');
    return isValidImg(img) ? img : null;
  }

  function applyImage(url) {
    const $img = $('#house-display-image');

    if (isValidImg(url)) {
      $img.attr('src', url);
      lastValidImage = url;
      return;
    }

    const fallback = stackTopUrl() || lastValidImage || getDefaultSizeImage();

    if (isValidImg(fallback)) {
      $img.attr('src', fallback);
      lastValidImage = fallback;
    }
  }

  function renderImageFromHistory() {
    applyImage(stackTopUrl());
  }

  function onOptionSelected($input) {
    const name = $input.attr('name');

    if (name === 'house_facade' || name === 'house_dritaret' || name === 'house_etancheite_terrasse') {
      if (typeof updateFacadeDependentImages === 'function') {
        updateFacadeDependentImages(false);
      }
    }

    const url = $input.data('image');
    stackPush(makeKey($input), url);
    renderImageFromHistory();
  }

  function onOptionUnselected($input) {
    stackRemove(makeKey($input));
    renderImageFromHistory();
  }

  function onSizeSelected($input) {
    const url = $input.data('image');

    imageStack = imageStack.filter(x => !x.key.startsWith('house_size|'));

    if (isValidImg(url)) {
      imageStack.unshift({ key: makeKey($input), url: String(url).trim() });
      lastValidImage = String(url).trim();
    }

    renderImageFromHistory();
  }

  function checkIsolationRequirements() {
    const isolationSelected = $('input[name="house_isolation"]:checked').length > 0;
    const outerIsolationSelected = $('input[name="house_outer_isolation"]:checked').length > 0;
    return isolationSelected && outerIsolationSelected;
  }

  function updateFacadeValidationWarning(optionName) {
    const $warning = $('#facade-validation-warning');
    const $facadeChecked = $('input[name="house_facade"]:checked');
    const facadeSelected = $facadeChecked.length > 0;
    const bothIsolationsSelected = checkIsolationRequirements();

    if (facadeSelected && !bothIsolationsSelected) {
      if (!optionName) optionName = $facadeChecked.val();

      $warning.find('.warning-option-name').text(optionName);
      $facadeChecked.prop('checked', false);
      $facadeChecked.closest('label').find('.option-content').removeClass('selected');

      triggerNativeChange($facadeChecked);
      onOptionUnselected($facadeChecked);

      $warning.show();
      updatePrice();
    } else {
      $warning.hide();
    }
  }

  function getSelectedFacadeType() {
    const $selectedFacade = $('input[name="house_facade"]:checked');
    if ($selectedFacade.length === 0) return null;

    const facadeName = ($selectedFacade.val() || '').toLowerCase();

    if (facadeName.indexOf('enduit') !== -1 || facadeName.indexOf('crepis') !== -1 || facadeName.indexOf('crépis') !== -1) return 'enduit';
    if (facadeName.indexOf('bardage') !== -1 || facadeName.indexOf('bois') !== -1) return 'bardage';

    return 'enduit';
  }

  function updateFacadeDependentImages(shouldRender) {
    if (shouldRender === undefined) shouldRender = true;

    const facadeType = getSelectedFacadeType();

    $('input[name="house_dritaret"]').each(function() {
      const $input = $(this);
      const imageAttr = facadeType === 'bardage' ? 'data-image-bardage' : 'data-image-enduit';
      const newImage = $input.attr(imageAttr) || '';

      $input.attr('data-image', newImage);
      $input.data('image', newImage);
    });

    $('input[name="house_etancheite_terrasse"]').each(function() {
      const $input = $(this);
      const imageAttr = facadeType === 'bardage' ? 'data-image-bardage' : 'data-image-enduit';
      const newImage = $input.attr(imageAttr) || '';

      $input.attr('data-image', newImage);
      $input.data('image', newImage);
    });

    const $selectedDritaret = $('input[name="house_dritaret"]:checked');
    if ($selectedDritaret.length > 0) {
      stackPush(makeKey($selectedDritaret), $selectedDritaret.data('image'));
    }

    const $selectedEtancheiteTerrasse = $('input[name="house_etancheite_terrasse"]:checked');
    if ($selectedEtancheiteTerrasse.length > 0) {
      stackPush(makeKey($selectedEtancheiteTerrasse), $selectedEtancheiteTerrasse.data('image'));
    }

    if (shouldRender) renderImageFromHistory();
  }

  function clearInputsByName(name) {
    $('input[name="' + name + '"]').each(function() {
      const $input = $(this);

      $input.prop('checked', false);
      $input.closest('label').find('.option-content').removeClass('selected');

      onOptionUnselected($input);
    });
  }

  function updateEtancheiteTerrasseVisibility() {
    const $etancheiteTerrasseSection = $('#etancheite-terrasse-section');
    const $toitureSection = $('#toiture-section');

    if (!$etancheiteTerrasseSection.length) {
      return;
    }

    if ($toitureSection.length && $('input[name="house_toiture"]:checked').length > 0) {
      $etancheiteTerrasseSection.hide();
      clearInputsByName('house_etancheite_terrasse');
    } else {
      $etancheiteTerrasseSection.show();
    }

    updatePrice();
  }

  $('.isolation-option, .outer-isolation-option, .facade-option, .struktura-plloqes-option, .izolimi-plloqes-option, .dritaret-option, .toiture-option, .etancheite-terrasse-option').on('click', function(e) {
    e.preventDefault();

    const $input = $(this).find('input[type="radio"]');
    if (!$input.length) return;

    const $group = $input.closest('.isolation-options, .outer-isolation-options, .facade-options, .struktura-plloqes-options, .izolimi-plloqes-options, .dritaret-options, .toiture-options, .etancheite-terrasse-options');
    const inputName = $input.attr('name');

    if (inputName === 'house_facade') {
      const bothIsolationsSelected = checkIsolationRequirements();

      if (!bothIsolationsSelected && !$input.is(':checked')) {
        const optionName = $input.val();

        $('#facade-validation-warning').find('.warning-option-name').text(optionName);
        $('#facade-validation-warning').show();

        return false;
      }
    }

    if (inputName === 'house_dritaret' && !$input.is(':checked')) {
      updateFacadeDependentImages(false);
    }

    if (inputName === 'house_etancheite_terrasse' && !$input.is(':checked')) {
      updateFacadeDependentImages(false);
    }

    if ($input.is(':checked')) {
      $input.prop('checked', false);
      $group.find('.option-content').removeClass('selected');

      triggerNativeChange($input);
      onOptionUnselected($input);
    } else {
      const groupName = $input.attr('name');

      $group.find('input[type="radio"][name="' + groupName + '"]').each(function() {
        const $radio = $(this);

        $radio.prop('checked', false);
        $radio.closest('label').find('.option-content').removeClass('selected');

        onOptionUnselected($radio);
      });

      $input.prop('checked', true);
      $(this).find('.option-content').addClass('selected');

      triggerNativeChange($input);
      onOptionSelected($input);
    }

    if (inputName === 'house_isolation' || inputName === 'house_outer_isolation') {
      updateFacadeValidationWarning();
    }

    if (inputName === 'house_facade') {
      const optionName = $input.val();

      updateFacadeValidationWarning(optionName);
      updateFacadeDependentImages(true);

      if ($input.is(':checked')) {
        onOptionSelected($input);
      }
    }

    if (inputName === 'house_toiture') {
      updateEtancheiteTerrasseVisibility();
    }

    updatePrice();
  });

  $('.etancheite-option').on('click', function(e) {
    e.preventDefault();

    const $input = $(this).find('input[name="house_etancheite"]');
    if (!$input.length) return;

    const willCheck = !$input.is(':checked');

    $('input[name="house_etancheite"]').each(function() {
      const $other = $(this);

      $other.prop('checked', false);
      $other.closest('.etancheite-option').find('.option-content').removeClass('selected');
      onOptionUnselected($other);
    });

    $input.prop('checked', willCheck);

    if (willCheck) {
      $(this).find('.option-content').addClass('selected');
      onOptionSelected($input);
    } else {
      $(this).find('.option-content').removeClass('selected');
      onOptionUnselected($input);
    }

    triggerNativeChange($input);
    updatePrice();
  });

  let lastSizeValue = $('input[name="house_size"]:checked').val() || null;

  function resetAllSelectionsExceptSize() {
    $('input[type="radio"]').not('[name="house_size"]').each(function() {
      const $input = $(this);

      $input.prop('checked', false);
      onOptionUnselected($input);
    });

    $('input[type="checkbox"]').each(function() {
      const $input = $(this);

      $input.prop('checked', false);
      onOptionUnselected($input);
    });

    $('.option-content').removeClass('selected');

    $('#facade-validation-warning').hide();
    $('#roof-validation-warning').hide();

    renderImageFromHistory();
    updatePrice();
  }

  $('input[name="house_size"]').on('change', function() {
    const newSizeValue = $(this).val();

    if (lastSizeValue && newSizeValue !== lastSizeValue) {
      resetAllSelectionsExceptSize();
    }

    lastSizeValue = newSizeValue;

    onSizeSelected($(this));
    updatePrice();
  });

  $('#price-dropdown').on('click', function(e) {
    e.preventDefault();

    const $breakdown = $('#price-breakdown');

    if ($breakdown.is(':visible')) {
      $breakdown.slideUp();
      $(this).removeClass('active');
    } else {
      $breakdown.slideDown();
      $(this).addClass('active');
    }
  });

  const defaultImage = $('input[name="house_size"]:checked').data('image');

  if (defaultImage && defaultImage !== '' && defaultImage !== 'undefined') {
    lastValidImage = defaultImage;
  }

  updatePrice();
  onSizeSelected($('input[name="house_size"]:checked'));
  updateFacadeValidationWarning();
  updateFacadeDependentImages(false);
  updateEtancheiteTerrasseVisibility();

  setTimeout(function() {
    onSizeSelected($('input[name="house_size"]:checked'));

    $('input[type="radio"]:checked').not('[name="house_size"]').each(function() {
      onOptionSelected($(this));
    });

    $('input[type="checkbox"]:checked').each(function() {
      onOptionSelected($(this));
      $(this).closest('label').find('.option-content').addClass('selected');
    });

    updateFacadeValidationWarning();
    updateFacadeDependentImages(true);
    updateEtancheiteTerrasseVisibility();
    updatePrice();
  }, 100);

  $('.continue-button').on('click', function(e) {
    e.preventDefault();

    const getSelectedOption = function(name) {
      const $checked = $('input[name="' + name + '"]:checked');

      if ($checked.length) {
        if ($checked.length > 1 || name.indexOf('[]') !== -1) {
          const options = [];
          let totalPrice = 0;
          let lastImage = null;

          $checked.each(function() {
            const $input = $(this);
            const val = $input.val();
            const price = getOptionPrice($input);

            totalPrice += price;

            const optionImage = $input.data('image');

            if (optionImage && String(optionImage).trim() !== '') {
              lastImage = String(optionImage).trim();
            }

            options.push(val);
          });

          return {
            value: options,
            price: totalPrice.toString(),
            image: lastImage || ''
          };
        }

        const price = getOptionPrice($checked);

        const option = {
          value: $checked.val(),
          price: price.toString()
        };

        const optionImage = $checked.data('image');

        if (optionImage && String(optionImage).trim() !== '') {
          option.image = String(optionImage).trim();
        }

        return option;
      }

      return null;
    };

    let houseImageUrl = ($('#house-display-image').attr('src') || '').trim();

    if (!houseImageUrl) {
      const defaultImg = ($('.house-image').first().attr('src') || '').trim();
      if (defaultImg) houseImageUrl = defaultImg;
    }

    if (!houseImageUrl) {
      const $selectedSize = $('input[name="house_size"]:checked');

      if ($selectedSize.length) {
        const sizeImage = ($selectedSize.data('image') || '').trim();
        if (sizeImage) houseImageUrl = sizeImage;
      }
    }

    const selections = {
      house: {
        name: $('.house-title').text(),
        id: 0,
        image: houseImageUrl || ''
      },
      size: getSelectedOption('house_size'),
      currentImage: houseImageUrl || '',
      isolation: getSelectedOption('house_isolation'),
      outerIsolation: getSelectedOption('house_outer_isolation'),
      facade: getSelectedOption('house_facade'),
      etancheite: getSelectedOption('house_etancheite'),
      toiture: getSelectedOption('house_toiture'),
      etancheiteTerrasse: getSelectedOption('house_etancheite_terrasse'),
      strukturaPlloqes: getSelectedOption('house_struktura_plloqes'),
      izolimiPlloqes: getSelectedOption('house_izolimi_plloqes'),
      dritaret: getSelectedOption('house_dritaret'),
      basePrice: Number(window.basePrice) || 0,
      priceBreakdown: window.priceBreakdown || [],
      totalPrice: Number(window.grandTotal) || 0,
      perdhesa: window.perdhesaData || {}
    };

    try {
      sessionStorage.setItem('house_selections', JSON.stringify(selections));
    } catch (e) {
      alert('Error saving selections. Please try again.');
      return;
    }

    window.location.href = '/checkout';
  });

  $('.quote-form').on('submit', function(e) {
    e.preventDefault();

    let isValid = true;

    $(this).find('input[required], select[required], textarea[required]').each(function() {
      if (!$(this).val()) {
        $(this).addClass('error');
        isValid = false;
      } else {
        $(this).removeClass('error');
      }
    });

    if (isValid) {
      $(this).find('.form-message').html('<div class="success">Quote request sent successfully!</div>');
    }
  });

  $('.house-gallery img').on('click', function() {
    const imgSrc = $(this).attr('src');
    const imgAlt = $(this).attr('alt');

    const lightbox =
      '<div class="lightbox">' +
      '<div class="lightbox-content">' +
      '<img src="' + imgSrc + '" alt="' + imgAlt + '">' +
      '<span class="close">&times;</span>' +
      '</div>' +
      '</div>';

    $('body').append(lightbox);

    $('.lightbox .close, .lightbox').on('click', function() {
      $('.lightbox').remove();
    });
  });

  $('.menu-toggle').on('click', function() {
    $('.nav-menu').toggleClass('active');
    $(this).toggleClass('active');
  });

  $(document).on('click', function(e) {
    if (!$(e.target).closest('.main-navigation').length) {
      $('.nav-menu').removeClass('active');
      $('.menu-toggle').removeClass('active');
    }
  });

  $('.tab-button').on('click', function() {
    const targetTab = $(this).data('tab');

    $('.tab-button').removeClass('active');
    $('.tab-pane').removeClass('active');

    $(this).addClass('active');
    $('#' + targetTab).addClass('active');
  });

  let isScrolled = false;

  function handleMobileScrollHideDescription() {
    if ($(window).width() > 768) {
      $('.house-image-section').removeClass('scrolled');
      isScrolled = false;
      return;
    }

    const scrollTop = $(window).scrollTop();
    const $imageSection = $('.house-image-section');
    const scrollThreshold = 50;

    if (scrollTop > scrollThreshold && !isScrolled) {
      $imageSection.addClass('scrolled');
      isScrolled = true;
    } else if (scrollTop <= scrollThreshold && isScrolled) {
      $imageSection.removeClass('scrolled');
      isScrolled = false;
    }
  }

  let scrollTimer = null;

  $(window).on('scroll', function() {
    if (scrollTimer !== null) clearTimeout(scrollTimer);

    scrollTimer = setTimeout(function() {
      handleMobileScrollHideDescription();
    }, 16);
  });

  $(window).on('resize', function() {
    handleMobileScrollHideDescription();
  });

  handleMobileScrollHideDescription();

  $('.option-mini-image').on('click', function(e) {
    e.preventDefault();
    e.stopPropagation();

    const $label = $(this).closest('label');
    const description = $label.find('input[type="radio"], input[type="checkbox"]').data('description');
    const optionName = $label.find('.option-name').text();
    const optionImage = $(this).attr('src');

    const modal =
      '<div class="option-modal">' +
      '<div class="modal-content">' +
      '<span class="modal-close">&times;</span>' +
      '<h3>' + optionName + '</h3>' +
      '<img src="' + optionImage + '" alt="' + optionName + '">' +
      '<p>' + (description || '') + '</p>' +
      '</div>' +
      '</div>';

    $('body').append(modal);

    $('.modal-close, .option-modal').on('click', function() {
      $('.option-modal').remove();
    });
  });
});

document.addEventListener('DOMContentLoaded', function() {
  const mainImage = document.getElementById('house-display-image');
  const lightbox = document.getElementById('house-image-lightbox');
  const lightboxImg = document.getElementById('house-lightbox-image');
  const closeBtn = lightbox ? lightbox.querySelector('.close') : null;

  if (!mainImage || !lightbox || !lightboxImg) return;

  mainImage.addEventListener('click', function() {
    lightboxImg.src = this.src;
    lightboxImg.alt = this.alt || '';
    lightbox.classList.add('is-active');
    document.body.style.overflow = 'hidden';
  });

  function closeLightbox() {
    lightbox.classList.remove('is-active');
    document.body.style.overflow = '';
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', closeLightbox);
  }

  lightbox.addEventListener('click', function(e) {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' || e.key === 'Esc') closeLightbox();
  });
});