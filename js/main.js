/**
 * ZEST INN BOUTIQUE HOTEL - MAIN JAVASCRIPT LOGIC
 * Navigation, Date Validation, Touch Swiping, Gallery & Lightbox
 */

document.addEventListener('DOMContentLoaded', () => {
  // -------------------------------------------------------------
  // 1. Sticky Navbar Transformation on Scroll
  // -------------------------------------------------------------
  const navbar = document.querySelector('.navbar-zest');
  if (navbar) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 40) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    });
  }

  // -------------------------------------------------------------
  // 2. Initialize Touch / Swipe Support for All Bootstrap Carousels
  // -------------------------------------------------------------
  const carousels = document.querySelectorAll('.carousel');
  carousels.forEach(carouselEl => {
    let touchStartX = 0;
    let touchEndX = 0;

    carouselEl.addEventListener('touchstart', e => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    carouselEl.addEventListener('touchend', e => {
      touchEndX = e.changedTouches[0].screenX;
      const swipeDistance = touchEndX - touchStartX;
      
      // Minimum swipe distance threshold of 40px
      if (swipeDistance < -40) {
        // Swiped Left -> Next slide
        const bsCarousel = bootstrap.Carousel.getOrCreateInstance(carouselEl);
        bsCarousel.next();
      } else if (swipeDistance > 40) {
        // Swiped Right -> Previous slide
        const bsCarousel = bootstrap.Carousel.getOrCreateInstance(carouselEl);
        bsCarousel.prev();
      }
    }, { passive: true });
  });

  // -------------------------------------------------------------
  // 3. Hotel Booking Form Validation & Date Initialization
  // -------------------------------------------------------------
  const bookingForms = document.querySelectorAll('.zest-booking-form');
  const today = new Date().toISOString().split('T')[0];

  bookingForms.forEach(form => {
    const fromDateInput = form.querySelector('[name="fromDate"], [name="checkIn"], #fromDate, #checkIn');
    const toDateInput = form.querySelector('[name="toDate"], [name="checkOut"], #toDate, #checkOut');
    const adultsInput = form.querySelector('[name="adults"], #adults');
    const alertBox = form.querySelector('.form-alert-msg') || document.getElementById('bookingAlert');

    // Set min date to today for check-in
    if (fromDateInput) {
      fromDateInput.setAttribute('min', today);
      if (!fromDateInput.value) {
        fromDateInput.value = today;
      }
      
      // Calculate default tomorrow for check-out
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      if (toDateInput) {
        toDateInput.setAttribute('min', today);
        if (!toDateInput.value) {
          toDateInput.value = tomorrowStr;
        }
      }

      // Automatically update Check-out min date when Check-in changes
      fromDateInput.addEventListener('change', () => {
        if (toDateInput) {
          const checkInDate = new Date(fromDateInput.value);
          if (!isNaN(checkInDate.getTime())) {
            const nextDay = new Date(checkInDate);
            nextDay.setDate(nextDay.getDate() + 1);
            const nextDayStr = nextDay.toISOString().split('T')[0];
            toDateInput.setAttribute('min', nextDayStr);
            if (new Date(toDateInput.value) <= checkInDate) {
              toDateInput.value = nextDayStr;
            }
          }
        }
      });
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const nameInput = form.querySelector('[name="guestName"], [name="fullName"], #name, #guestName');
      const name = nameInput ? nameInput.value.trim() : 'Guest';
      const fromDate = fromDateInput ? fromDateInput.value : '';
      const toDate = toDateInput ? toDateInput.value : '';
      const adults = adultsInput ? parseInt(adultsInput.value, 10) : 1;

      let errorMessage = '';

      if (nameInput && !name) {
        errorMessage = 'Please enter your full name.';
      } else if (!fromDate || !toDate) {
        errorMessage = 'Please select valid Check-in and Check-out dates.';
      } else if (new Date(fromDate) >= new Date(toDate)) {
        errorMessage = 'Check-out date must be strictly after the Check-in date.';
      } else if (isNaN(adults) || adults < 1) {
        errorMessage = 'Minimum 1 Adult guest is required.';
      }

      if (errorMessage) {
        showFormAlert(alertBox, errorMessage, 'danger');
        return;
      }

      // Success logic
      const successMessage = `Thank you, ${name}! Your booking request for ${fromDate} to ${toDate} (${adults} Adult${adults > 1 ? 's' : ''}) has been received successfully! Our team will contact you shortly.`;
      showFormAlert(alertBox, successMessage, 'success');

      // Optional trigger modal or reset
      if (form.getAttribute('id') === 'fullBookingForm') {
        const modalEl = document.getElementById('bookingSuccessModal');
        if (modalEl) {
          document.getElementById('bookingModalDetails').innerText = successMessage;
          const modal = new bootstrap.Modal(modalEl);
          modal.show();
        }
      }
    });
  });

  function showFormAlert(container, message, type) {
    if (!container) {
      alert(message);
      return;
    }
    container.innerHTML = `
      <div class="alert ${type === 'success' ? 'alert-zest-success' : 'alert-zest-danger'} alert-dismissible fade show" role="alert">
        <i class="bi ${type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'} me-2"></i>
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>
    `;
    container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // -------------------------------------------------------------
  // 4. Contact Form Validation
  // -------------------------------------------------------------
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const alertBox = document.getElementById('contactAlert');
      const name = document.getElementById('contactName')?.value.trim();
      const email = document.getElementById('contactEmail')?.value.trim();
      const message = document.getElementById('contactMessage')?.value.trim();

      if (!name || !email || !message) {
        showFormAlert(alertBox, 'Please fill in all required fields (Name, Email, Message).', 'danger');
        return;
      }

      // Basic email regex
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showFormAlert(alertBox, 'Please provide a valid email address.', 'danger');
        return;
      }

      showFormAlert(alertBox, `Thank you, ${name}! Your message has been sent successfully. We will get back to you within 24 hours.`, 'success');
      contactForm.reset();
    });
  }

  // -------------------------------------------------------------
  // 5. Gallery Filter Logic & Lightbox Navigation
  // -------------------------------------------------------------
  const filterBtns = document.querySelectorAll('.gallery-btn-filter');
  const galleryItems = document.querySelectorAll('.gallery-item-col');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      galleryItems.forEach(item => {
        if (filter === 'all' || item.getAttribute('data-category') === filter) {
          item.style.display = 'block';
          item.classList.add('fadeIn');
        } else {
          item.style.display = 'none';
        }
      });
    });
  });

  // Lightbox modal logic
  const lightboxModal = document.getElementById('lightboxModal');
  if (lightboxModal) {
    let currentGalleryList = [];
    let currentIndex = 0;

    const modalImg = document.getElementById('lightboxImage');
    const modalTitle = document.getElementById('lightboxTitle');
    const modalDesc = document.getElementById('lightboxDesc');
    const prevBtn = document.getElementById('lightboxPrev');
    const nextBtn = document.getElementById('lightboxNext');

    document.querySelectorAll('.gallery-item').forEach(item => {
      item.addEventListener('click', () => {
        // Gather visible items
        const visibleItems = Array.from(document.querySelectorAll('.gallery-item-col'))
          .filter(col => col.style.display !== 'none')
          .map(col => col.querySelector('.gallery-item'));

        currentGalleryList = visibleItems;
        currentIndex = currentGalleryList.indexOf(item);
        if (currentIndex === -1) currentIndex = 0;

        updateLightboxContent();
        const modal = new bootstrap.Modal(lightboxModal);
        modal.show();
      });
    });

    function updateLightboxContent() {
      if (!currentGalleryList.length || !currentGalleryList[currentIndex]) return;
      const target = currentGalleryList[currentIndex];
      const img = target.querySelector('img');
      const title = target.getAttribute('data-title') || img.alt || 'Zest Inn Gallery';
      const desc = target.getAttribute('data-desc') || 'Luxury Boutique Experience';

      modalImg.src = img.src;
      modalImg.alt = img.alt;
      modalTitle.innerText = title;
      modalDesc.innerText = desc;
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (currentGalleryList.length === 0) return;
        currentIndex = (currentIndex - 1 + currentGalleryList.length) % currentGalleryList.length;
        updateLightboxContent();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (currentGalleryList.length === 0) return;
        currentIndex = (currentIndex + 1) % currentGalleryList.length;
        updateLightboxContent();
      });
    }

    // Touch swipe for Lightbox modal
    let modalTouchX = 0;
    lightboxModal.addEventListener('touchstart', e => {
      modalTouchX = e.changedTouches[0].screenX;
    }, { passive: true });

    lightboxModal.addEventListener('touchend', e => {
      const endX = e.changedTouches[0].screenX;
      if (endX < modalTouchX - 40 && nextBtn) {
        nextBtn.click();
      } else if (endX > modalTouchX + 40 && prevBtn) {
        prevBtn.click();
      }
    }, { passive: true });
  }
});
