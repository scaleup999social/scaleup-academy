// ScaleUp Chennai Core Application script
import { showToast } from "./utils.js";

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initHeaderScroll();
  initMobileNavigation();
  initFaqAccordions();
  initScrollEffects();
  initContactForm();
});

/**
 * Initialize Light/Dark theme configuration
 */
function initTheme() {
  const themeToggleBtns = document.querySelectorAll(".theme-toggle-btn");
  const currentTheme = localStorage.getItem("theme") || "dark";
  
  // Set initial state
  document.documentElement.setAttribute("data-theme", currentTheme);
  
  themeToggleBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const activeTheme = document.documentElement.getAttribute("data-theme");
      const newTheme = activeTheme === "dark" ? "light" : "dark";
      
      document.documentElement.setAttribute("data-theme", newTheme);
      localStorage.setItem("theme", newTheme);
      
      showToast(`${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)} Mode Enabled`, "info");
    });
  });
}

/**
 * Handle Header styling on scroll
 */
function initHeaderScroll() {
  const header = document.querySelector("header");
  const scrollProgress = document.querySelector(".scroll-progress");
  
  window.addEventListener("scroll", () => {
    // 1. Shrink Header
    if (window.scrollY > 50) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
    
    // 2. Scroll Progress Bar
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
    if (scrollProgress) {
      scrollProgress.style.width = scrolled + "%";
    }
  });
}

/**
 * Handles mobile hamburger drawer menus
 */
function initMobileNavigation() {
  const hamburgerBtn = document.querySelector(".hamburger-btn");
  const navLinks = document.querySelector(".nav-links");
  const links = document.querySelectorAll(".nav-links a");
  
  if (hamburgerBtn && navLinks) {
    hamburgerBtn.addEventListener("click", () => {
      hamburgerBtn.classList.toggle("active");
      navLinks.classList.toggle("active");
    });
    
    // Close menu when links are clicked
    links.forEach(link => {
      link.addEventListener("click", () => {
        hamburgerBtn.classList.remove("active");
        navLinks.classList.remove("active");
      });
    });
  }
}

/**
 * FAQ Collapsible Accordions
 */
function initFaqAccordions() {
  const faqItems = document.querySelectorAll(".faq-item");
  
  faqItems.forEach(item => {
    const btn = item.querySelector(".faq-question-btn");
    
    btn.addEventListener("click", () => {
      const isOpen = item.classList.contains("open");
      
      // Close all open items first for single-accordion effect
      document.querySelectorAll(".faq-item.open").forEach(openItem => {
        openItem.classList.remove("open");
      });
      
      if (!isOpen) {
        item.classList.add("open");
      }
    });
  });
}

/**
 * Floating buttons visibility on scroll
 */
function initScrollEffects() {
  const floatingReg = document.querySelector(".floating-register-btn");
  const backToTop = document.querySelector(".back-to-top-btn");
  
  window.addEventListener("scroll", () => {
    // Show buttons after scrolling 400px
    if (window.scrollY > 400) {
      if (floatingReg) floatingReg.classList.add("visible");
      if (backToTop) backToTop.classList.add("visible");
    } else {
      if (floatingReg) floatingReg.classList.remove("visible");
      if (backToTop) backToTop.classList.remove("visible");
    }
  });
  
  if (backToTop) {
    backToTop.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    });
  }
}

/**
 * Contact Form Mock Submission
 */
function initContactForm() {
  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      
      const name = document.getElementById("contactName").value.trim();
      const email = document.getElementById("contactEmail").value.trim();
      const message = document.getElementById("contactMessage").value.trim();
      
      if (!name || !email || !message) {
        showToast("Please fill in all message fields.", "warning");
        return;
      }
      
      // Mock submit success
      showToast(`Thank you ${name}! Your inquiry has been sent.`, "success");
      contactForm.reset();
    });
  }
}
