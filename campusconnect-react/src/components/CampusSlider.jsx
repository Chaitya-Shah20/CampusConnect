import { useCallback, useEffect, useRef, useState } from 'react'

const SLIDES = [
  {
    img: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80',
    alt: 'College Campus Architecture',
    title: 'College Campus & Grounds',
    desc: 'A vibrant, modern campus built for academic discovery and lifelong growth.',
  },
  {
    img: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
    alt: 'Students walking and talking on campus',
    title: 'Campus Life & Friendships',
    desc: 'Meet peers, share ideas, and create unforgettable campus experiences.',
  },
  {
    img: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',
    alt: 'Students studying together in library',
    title: 'Collaborative Study Sessions',
    desc: 'Quiet zones and group study spaces designed for deep focus and shared learning.',
  },
  {
    img: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80',
    alt: 'Students working together at hackathon',
    title: 'Hackathons & Team Projects',
    desc: 'Build real-world software, participate in hackathons, and innovate together.',
  },
  {
    img: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
    alt: 'College events and celebrations',
    title: 'College Events & Fests',
    desc: 'Celebrate cultural festivals, tech symposia, and university events year-round.',
  },
]

const AUTO_SLIDE_MS = 4500

export default function CampusSlider() {
  const [index, setIndex] = useState(0)
  const timerRef = useRef(null)
  const touchStartX = useRef(0)

  const goTo = useCallback((i) => {
    setIndex(((i % SLIDES.length) + SLIDES.length) % SLIDES.length)
  }, [])

  const next = useCallback(() => goTo(index + 1), [goTo, index])
  const prev = useCallback(() => goTo(index - 1), [goTo, index])

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const startTimer = useCallback(() => {
    stopTimer()
    timerRef.current = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), AUTO_SLIDE_MS)
  }, [stopTimer])

  useEffect(() => {
    startTimer()
    return stopTimer
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleTouchStart(e) {
    touchStartX.current = e.changedTouches[0].screenX
    stopTimer()
  }

  function handleTouchEnd(e) {
    const dist = e.changedTouches[0].screenX - touchStartX.current
    if (Math.abs(dist) > 45) {
      if (dist < 0) next()
      else prev()
    }
    startTimer()
  }

  return (
    <section className="campus-slider-section" id="campus-life">
      <h2>Life at Campus</h2>
      <p className="slider-description">
        Discover the people, projects and experiences that make our campus community unique.
      </p>

      <div
        className="slider-container"
        id="campusSlider"
        aria-label="Campus Life Image Slider"
        onMouseEnter={stopTimer}
        onMouseLeave={startTimer}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="slider-track" style={{ transform: `translateX(-${index * 100}%)` }}>
          {SLIDES.map((slide) => (
            <div className="slide" key={slide.title}>
              <img src={slide.img} alt={slide.alt} />
              <div className="slide-caption">
                <h4>{slide.title}</h4>
                <p>{slide.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <button
          className="slider-btn prev-btn"
          aria-label="Previous slide"
          onClick={() => { prev(); startTimer() }}
        >
          &#10094;
        </button>
        <button
          className="slider-btn next-btn"
          aria-label="Next slide"
          onClick={() => { next(); startTimer() }}
        >
          &#10095;
        </button>
      </div>

      <div className="slider-dots" aria-label="Slide navigation dots">
        {SLIDES.map((slide, i) => (
          <button
            key={slide.title}
            className={`dot${i === index ? ' active' : ''}`}
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => { goTo(i); startTimer() }}
          />
        ))}
      </div>
    </section>
  )
}
