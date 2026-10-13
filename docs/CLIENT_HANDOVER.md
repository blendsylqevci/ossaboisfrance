# Ossa Bois France — checklist de remise

Contrôle du 8 septembre 2026. Ce document ne contient aucun identifiant secret.

## État

La remise définitive reste conditionnée à la réception et à la validation des
informations légales de l'entreprise. Ne pas présenter les mentions légales
actuelles comme une version finalisée : elles contiennent encore des exemples.

Dernière version production vérifiée avant ce nettoyage : `3ad83ff`.
Le nettoyage décrit ci-dessous doit encore être publié.

## Contrôles effectués

- Dernier déploiement Vercel : succès.
- Suite automatisée : 93 tests réussis, vérification TypeScript réussie.
- Pages publiques mobiles : accueil, catalogue, contact, B2B et checkout
  répondent en HTTP 200, sans erreur JavaScript ni débordement horizontal
  observés dans le contrôle effectué.
- Aucun formulaire production n'a été envoyé et aucune commande n'a été
  supprimée pendant ce contrôle.
- Les tests de réception contact et commande ont été confirmés par le propriétaire
  lors de la configuration précédente. Le nouveau template administrateur a été
  vérifié localement ; sa réception réelle reste à contrôler après publication.
- Les aperçus générés dans `output/` sont exclus de Git et du déploiement.
- Les logs de succès qui exposaient l'URL de la capture de configuration et
  l'identifiant interne de commande ont été retirés ; les erreurs restent suivies.
- Le checkout est exclu de l'indexation par une directive robots propre à la page.

## À obtenir de l'entreprise avant validation finale

- Dénomination et forme juridique confirmées ; capital social.
- RCS, SIRET et numéro de TVA.
- IDU ADEME si applicable.
- Identité et fonction du directeur de publication.
- Assurance professionnelle applicable : assureur, contrat, couverture.
- Médiateur de consommation : organisme, adresse et site.
- Relecture et validation des mentions légales, CGU, confidentialité et conditions
  commerciales par la personne compétente de l'entreprise.

Ne pas remplacer ces éléments par des valeurs inventées ou par les exemples
présents dans le code. Le numéro de contact confirmé est +38343737000.

## Recette finale avec le client

1. Vérifier les surfaces brutes et les catégories de chaque modèle dans le CMS :
   elles déterminent les prix. Ne pas inventer de dimensions manquantes.
2. Configurer une maison en 160, sélectionner des options puis passer en 200 :
   vérifier la conservation des choix et le recalcul.
3. Vérifier le checkout avant et après le choix du montage, puis la revue finale.
4. Envoyer une demande identifiée TEST avec autorisation : vérifier client,
   administrateur, pièces jointes PDF et réponse au bon destinataire.
5. Tester les deux modes de montage et comparer transport, montage et total HT.
6. Vérifier une réinitialisation de mot de passe sur un compte de test autorisé.
7. Contrôler les langues FR/EN/DE/NL et les appareils réellement utilisés.
8. Faire valider les contenus, photos, témoignages, tarifs et informations légales.

Les anciens e-mails ne sont pas modifiés par un nouveau déploiement. Une nouvelle
demande est nécessaire pour vérifier un nouveau template.

## Accès et exploitation

- Website : https://ossaboisfrance.com
- Administration : https://ossaboisfrance.com/admin
- Vercel : projet ossaboisfrance, publication automatique depuis main.
- Resend : envoi transactionnel pour ossaboisfrance.com.
- Réception des messages : boîtes et redirections cPanel Namecheap.
- Contact interne : info@ossaboisfrance.com ; expéditeur commande :
  order@ossaboisfrance.com ; support : support@ossaboisfrance.com.
- Les métadonnées IP/localisation/terminal sont indicatives, réservées au
  message administrateur, sans GPS ; elles ne constituent pas une preuve d'identité.
- Remettre les accès par invitation nominative, activer la MFA et utiliser un
  gestionnaire de mots de passe. Ne jamais remettre de secrets dans Git ou PDF.
- Vérifier la propriété des comptes et retirer les accès de développement devenus
  inutiles après accord explicite du propriétaire.

## Sauvegardes et suivi

Consulter `docs/OPERATIONS.md` et `docs/BACKUP_RUNBOOK.md`.
Avant remise, vérifier un résultat récent du workflow de sauvegarde et organiser
un test de restauration isolé. La présence du workflow ne prouve pas à elle seule
qu'une sauvegarde récente est exploitable.

Le endpoint `/api/health` contrôle la base et un média. Il ne remplace pas un test
de délivrabilité d'e-mail ni un test complet du checkout.

## Nettoyage des données de test

Aucune suppression de données production n'est autorisée implicitement par cette
checklist. Préparer la liste exacte des commandes, médias ou comptes concernés,
confirmer qu'ils sont fictifs, vérifier une sauvegarde et obtenir l'accord du
propriétaire avant toute suppression.
