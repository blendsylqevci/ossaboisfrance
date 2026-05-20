"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

type Review = {
  content: string;
  name: string;
  title: string;
  image?: string;
  socialIcon?: string;
};

type ReviewsCarouselProps = {
  reviews: Review[];
};

export function ReviewsCarousel({ reviews }: ReviewsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % reviews.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [reviews.length]);

  return (
    <div className="reviews-carousel">
      <div className="reviews-carousel-viewport">
        <div
          className="reviews-carousel-track"
          style={{
            transform: `translateX(-${currentIndex * 100}%)`,
          }}
        >
          {reviews.map((rev, index) => (
            <div className="reviews-carousel-slide" key={index}>
              <div className="reviews-quote-icon">“</div>
              <div className="reviews-stars">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className="star filled">★</span>
                ))}
              </div>
              <p className="reviews-text">{rev.content}</p>
              <div className="reviews-author">
                {rev.image ? (
                  <div className="reviews-avatar">
                    <Image
                      src={rev.image}
                      alt={rev.name}
                      width={48}
                      height={48}
                      style={{ objectFit: "cover", borderRadius: "50%" }}
                    />
                  </div>
                ) : (
                  <div className="reviews-avatar-placeholder">
                    {rev.name.charAt(0)}
                  </div>
                )}
                <div className="reviews-author-info">
                  <strong className="reviews-name">{rev.name}</strong>
                  <span className="reviews-username">{rev.title}</span>
                </div>
                {rev.socialIcon && (
                  <div className="reviews-social-logo">
                    <Image
                      src={rev.socialIcon}
                      alt="social"
                      width={24}
                      height={24}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="reviews-carousel-dots">
        {reviews.map((_, index) => (
          <button
            key={index}
            className={`reviews-carousel-dot ${index === currentIndex ? "active" : ""}`}
            onClick={() => setCurrentIndex(index)}
            aria-label={`Aller au témoignage ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
