import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Navbar() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isGallery, setIsGallery] = useState(false); // State for Gallery
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Update state based on the current URL pathname
    const pathname = location.pathname;
    setIsAdmin(pathname === '/admin');
    setIsGallery(pathname === '/gallery'); // Check if it's the gallery route
  }, [location.pathname]);

  useEffect(() => {
    // Add click event listeners to all navbar links
    const links = document.querySelectorAll('.navbar-nav .nav-link');
    const toggleButton = document.querySelector('.navbar-toggler');

    const handleClick = () => {
      // Close the navbar menu
      if (toggleButton) {
        toggleButton.click();
      }
    };

    links.forEach(link => {
      link.addEventListener('click', handleClick);
    });

    // Clean up event listeners on component unmount
    return () => {
      links.forEach(link => {
        link.removeEventListener('click', handleClick);
      });
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo(0, 0); // Scroll to the top of the page
  };

  const handleAdminToggle = (event) => {
    event.preventDefault(); // Prevent the default anchor behavior

    if (isAdmin) {
      setIsAdmin(false);
      navigate('/'); // Navigate to root
    } else {
      setIsAdmin(true);
      navigate('/admin'); // Navigate to Admin page
    }
    scrollToTop(); // Scroll to top after navigation
  };

  const handleGalleryToggle = (event) => {
    event.preventDefault(); // Prevent the default anchor behavior

    if (isGallery) {
      setIsGallery(false);
      navigate('/'); // Navigate to root
    } else {
      setIsGallery(true);
      navigate('/gallery'); // Navigate to Gallery page
    }
    scrollToTop(); // Scroll to top after navigation
  };

  const scrollToSection = (event, sectionId) => {
    event.preventDefault(); // Prevent the default anchor behavior
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' }); // Smooth scroll to the section
    }
  };

  return (
    <nav className="navbar navbar-expand-lg bg-white navbar-light fixed-top shadow py-lg-0 px-4 px-lg-5 wow fadeIn" data-wow-delay="0.1s">
      <a href="" className="navbar-brand d-block d-lg-none">
        <h1 className="text-primary">Ayyappa Digitals</h1>
      </a>
      <button type="button" className="navbar-toggler" data-bs-toggle="collapse" data-bs-target="#navbarNav">
        <span className="navbar-toggler-icon"></span>
      </button>
      <div className="collapse navbar-collapse justify-content-between py-4 py-lg-0" id="navbarNav">
        <div className="navbar-nav ms-auto py-0">
          <a href="#home" className="nav-item nav-link" onClick={(e) => scrollToSection(e, 'home')}>Home</a>
          <a href="#about" className="nav-item nav-link" onClick={(e) => scrollToSection(e, 'about')}>About</a>
          <a href="#services" className="nav-item nav-link" onClick={(e) => scrollToSection(e, 'services')}>Services</a>
        </div>
        <a href="" className="navbar-brand bg-primary py-2 px-4 mx-3 d-none d-lg-block">
          <h1 className="text-white">Ayyappa Digitals</h1>
        </a>
        <div className="navbar-nav me-auto py-0">
          <a href="#projects" className="nav-item nav-link" onClick={(e) => scrollToSection(e, 'project')}>Features</a>
          <a href="#team" className="nav-item nav-link" onClick={(e) => scrollToSection(e, 'team')}>Team</a>
          
          {/* Toggle between root and dynamic Gallery page */}
          <a
            href="#"
            className="nav-item nav-link"
            onClick={handleGalleryToggle}
          >
            {isGallery ? "NotGallery" : "Gallery"}
          </a>
          
          {/* Toggle between root and dynamic Admin page */}
          <a
            href="#"
            className="nav-item nav-link"
            onClick={handleAdminToggle}
          >
            {isAdmin ? "NotAdmin" : "Admin"}
          </a>
        </div>
      </div>
    </nav>
  );
}
