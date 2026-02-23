// Mobile drawer toggle with hamburger animation
(function(){
  const btn = document.getElementById('navToggle');
  const drawer = document.getElementById('drawer');
  const hamburger = document.getElementById('hamburgerIcon');
  const backToTop = document.getElementById('backToTop');
  const grid = document.querySelector('.grid');
  const contactPanel = document.getElementById('contactPanel');

  if(btn && drawer && hamburger){
    btn.addEventListener('click', ()=>{
      const open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      drawer.style.display = open ? 'none' : 'flex';
      drawer.setAttribute('aria-hidden', String(open));

      if(open) {
        hamburger.classList.remove('open');
      } else {
        hamburger.classList.add('open');
      }
    });
  }

  // Close drawer on window resize to desktop size
  window.addEventListener('resize', () => {
    if(window.innerWidth > 900 && drawer.style.display === 'flex') {
      drawer.style.display = 'none';
      btn.setAttribute('aria-expanded', 'false');
      drawer.setAttribute('aria-hidden', 'true');
      hamburger.classList.remove('open');
    }
    
    // Handle contact panel position based on viewport height
    checkContactPanelPosition();
  });

  // Check if contact panel should move to bottom based on viewport height
  function checkContactPanelPosition() {
    if (window.innerWidth > 900) {
      const viewportHeight = window.innerHeight;
      // If viewport height is less than 700px, move contact to bottom
      if (viewportHeight < 700) {
        grid.classList.add('contact-bottom');
      } else {
        grid.classList.remove('contact-bottom');
      }
    } else {
      grid.classList.remove('contact-bottom');
    }
  }

  // Initial check
  checkContactPanelPosition();

  // Close drawer when clicking outside on mobile
  document.addEventListener('click', (e) => {
    if(window.innerWidth <= 900 && drawer.style.display === 'flex') {
      if(!drawer.contains(e.target) && !btn.contains(e.target)) {
        drawer.style.display = 'none';
        btn.setAttribute('aria-expanded', 'false');
        drawer.setAttribute('aria-hidden', 'true');
        hamburger.classList.remove('open');
      }
    }
  });

  // Smooth scroll for in-page links (except contact buttons which are handled separately)
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    // Skip ALL contact buttons as they're handled by their own listener
    if(a.classList.contains('contact') || 
       a.classList.contains('nav-contact-btn') || 
       (a.getAttribute('href') === '#contact' && (a.closest('.drawer') || a.closest('.nav-links')))) {
      return;
    }
    
    a.addEventListener('click', e=>{
      const target = document.querySelector(a.getAttribute('href'));
      if(target){ 
        e.preventDefault(); 
        target.scrollIntoView({behavior:'smooth',block:'start'}); 
      }
    });
  });

  // Back to top button functionality
  if(backToTop) {
    let isVisible = false;
    
    window.addEventListener('scroll', () => {
      const shouldShow = window.pageYOffset > 300;
      
      if (shouldShow && !isVisible) {
        // Show with bounce animation
        backToTop.classList.remove('hiding');
        backToTop.classList.add('visible');
        isVisible = true;
      } else if (!shouldShow && isVisible) {
        // Hide with bounce animation
        backToTop.classList.add('hiding');
        isVisible = false;
        
        // Wait for animation to finish before hiding
        setTimeout(() => {
          if (!isVisible) {
            backToTop.classList.remove('visible', 'hiding');
          }
        }, 400);
      }
    });

    backToTop.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // Skills flip functionality - FIXED: proper event delegation
  const skillsGrid = document.querySelector('.skills-grid');
  if (skillsGrid) {
    skillsGrid.addEventListener('click', (e) => {
      const skill = e.target.closest('.skill');
      if (skill) {
        e.stopPropagation();
        e.preventDefault();
        skill.classList.toggle('flipped');
      }
    });
  }

  // Job experience expand functionality
  document.querySelectorAll('.job').forEach(job => {
    job.addEventListener('click', (e) => {
      if (e.target.classList.contains('job-close')) {
        e.stopPropagation();
        job.classList.remove('expanded');
        return;
      }

      job.classList.toggle('expanded');
    });
  });

  // Projects expand functionality
  document.querySelectorAll('.proj').forEach(proj => {
    proj.addEventListener('click', (e) => {
      if (e.target.classList.contains('proj-close')) {
        e.stopPropagation();
        proj.classList.remove('expanded');
        return;
      }

      proj.classList.toggle('expanded');
    });
  });

  // Contact button functionality - highlight contact panel on desktop, scroll on mobile
  const heroContactButton = document.querySelector('.download-btn.contact');
  const navContactButton = document.querySelector('.nav-links .nav-contact-btn');
  const drawerContactButton = document.querySelector('.drawer a[href="#contact"]');
  
  // Hero and Nav contact buttons - same behavior
  [heroContactButton, navContactButton].forEach(btn => {
    if (!btn) return;
    
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      
      if (window.innerWidth > 900 && !grid.classList.contains('contact-bottom')) {
        // Desktop mode with contact panel on right - just highlight, no scroll
        if (contactPanel) {
          contactPanel.classList.add('highlight-border');
          
          // Remove highlight after 2 seconds
          setTimeout(() => {
            contactPanel.classList.remove('highlight-border');
          }, 2000);
        }
      } else {
        // Mobile mode or contact at bottom - scroll to contact section
        const contactSection = document.getElementById('contact');
        if (contactSection) {
          contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          
          // Add highlight effect
          if (contactPanel) {
            contactPanel.classList.add('highlight-border');
            setTimeout(() => {
              contactPanel.classList.remove('highlight-border');
            }, 2000);
          }
        }
      }
    });
  });
  
  // Drawer contact button - separate handler that doesn't close drawer
  if (drawerContactButton) {
    drawerContactButton.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Scroll to contact section
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        // Add highlight effect
        if (contactPanel) {
          contactPanel.classList.add('highlight-border');
          setTimeout(() => {
            contactPanel.classList.remove('highlight-border');
          }, 2000);
        }
      }
      
      // Don't close the drawer - let the user close it manually
    });
  }

  // Add tooltips to stat buttons with line breaks
  const stats = document.querySelectorAll('.stat');
  stats.forEach(stat => {
    const text = stat.querySelector('h4').textContent.trim();
    const desc = stat.querySelector('p').textContent.trim();
    
    if (text.includes('7+')) {
      stat.setAttribute('data-tooltip', 'Road racing\nAutocross\nDrifting');
    } else if (text.includes('2+')) {
      stat.setAttribute('data-tooltip', 'Autonomous vehicles\nServiceNow');
    } else if (text === 'NVIDIA') {
      stat.setAttribute('data-tooltip', 'Current Employer');
    } else if (text.includes('B.S. CS')) {
      stat.setAttribute('data-tooltip', 'Computer Science Degree');
    }
  });

  // Skills see more functionality
  const skillsSeeMore = document.getElementById('skillsSeeMore');
  
  if (skillsSeeMore && skillsGrid) {
    skillsSeeMore.addEventListener('click', function(e) {
      e.preventDefault();
      
      const isExpanded = this.getAttribute('aria-expanded') === 'true';
      
      if (isExpanded) {
        // Collapsing - different behavior for mobile vs desktop
        const isMobile = window.innerWidth <= 600;
        
        if (isMobile) {
          // Mobile: lock current scroll position, then adjust after collapse
          const currentScroll = window.pageYOffset;
          
          this.setAttribute('aria-expanded', 'false');
          skillsGrid.classList.remove('skills-expanded');
          
          // Keep scroll locked during collapse animation
          window.scrollTo({ top: currentScroll, behavior: 'auto' });
          
          // After collapse completes, scroll button to bottom of viewport
          setTimeout(() => {
            const buttonRect = skillsSeeMore.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const targetScroll = window.pageYOffset + buttonRect.top - viewportHeight + buttonRect.height + 20;
            window.scrollTo({ top: targetScroll, behavior: 'auto' });
          }, 500);
        } else {
          // Desktop: keep viewport completely static
          const scrollTop = window.pageYOffset;
          const skillsSection = document.getElementById('skills');
          const skillsTop = skillsSection.getBoundingClientRect().top + scrollTop;
          
          this.setAttribute('aria-expanded', 'false');
          skillsGrid.classList.remove('skills-expanded');
          
          // Calculate how much height was removed and adjust scroll to compensate
          requestAnimationFrame(() => {
            const heightDiff = skillsTop - (skillsSection.getBoundingClientRect().top + window.pageYOffset);
            
            // If we're scrolled past the skills section, adjust scroll to keep view static
            if (scrollTop > skillsTop) {
              window.scrollTo({ top: scrollTop - heightDiff, behavior: 'auto' });
            }
          });
        }
      } else {
        // Expanding
        this.setAttribute('aria-expanded', 'true');
        skillsGrid.classList.add('skills-expanded');
      }
    });
  }

  // Skills expand all functionality - triggers see more button
  const skillsExpandAll = document.getElementById('skillsExpandAll');
  
  if (skillsExpandAll && skillsSeeMore) {
    skillsExpandAll.addEventListener('click', () => {
      const isExpanded = skillsSeeMore.getAttribute('aria-expanded') === 'true';
      
      if (isExpanded) {
        // Collapse - trigger see more button to collapse
        skillsSeeMore.setAttribute('aria-expanded', 'false');
        skillsGrid.classList.remove('skills-expanded');
        skillsExpandAll.classList.remove('all-expanded');
      } else {
        // Expand - trigger see more button to expand
        skillsSeeMore.setAttribute('aria-expanded', 'true');
        skillsGrid.classList.add('skills-expanded');
        skillsExpandAll.classList.add('all-expanded');
      }
    });
    
    // Update expand all button when see more is clicked
    skillsSeeMore.addEventListener('click', () => {
      setTimeout(() => {
        const isExpanded = skillsSeeMore.getAttribute('aria-expanded') === 'true';
        if (isExpanded) {
          skillsExpandAll.classList.add('all-expanded');
        } else {
          skillsExpandAll.classList.remove('all-expanded');
        }
      }, 50);
    });
  }

  // Experience expand all functionality
  const experienceExpandAll = document.getElementById('experienceExpandAll');
  
  if (experienceExpandAll) {
    experienceExpandAll.addEventListener('click', () => {
      const isAllExpanded = experienceExpandAll.classList.contains('all-expanded');
      const jobs = document.querySelectorAll('.job');
      
      if (isAllExpanded) {
        // Collapse all
        jobs.forEach(job => job.classList.remove('expanded'));
        experienceExpandAll.classList.remove('all-expanded');
      } else {
        // Expand all
        jobs.forEach(job => job.classList.add('expanded'));
        experienceExpandAll.classList.add('all-expanded');
      }
    });
    
    // Update button state when individual jobs are clicked
    document.querySelectorAll('.job').forEach(job => {
      job.addEventListener('click', () => {
        setTimeout(() => {
          const allExpanded = Array.from(document.querySelectorAll('.job')).every(j => j.classList.contains('expanded'));
          if (allExpanded) {
            experienceExpandAll.classList.add('all-expanded');
          } else {
            experienceExpandAll.classList.remove('all-expanded');
          }
        }, 50);
      });
    });
  }

  // Projects expand all functionality
  const projectsExpandAll = document.getElementById('projectsExpandAll');
  
  if (projectsExpandAll) {
    projectsExpandAll.addEventListener('click', () => {
      const isAllExpanded = projectsExpandAll.classList.contains('all-expanded');
      const projects = document.querySelectorAll('.proj');
      
      if (isAllExpanded) {
        // Collapse all
        projects.forEach(proj => proj.classList.remove('expanded'));
        projectsExpandAll.classList.remove('all-expanded');
      } else {
        // Expand all
        projects.forEach(proj => proj.classList.add('expanded'));
        projectsExpandAll.classList.add('all-expanded');
      }
    });
    
    // Update button state when individual projects are clicked
    document.querySelectorAll('.proj').forEach(proj => {
      proj.addEventListener('click', () => {
        setTimeout(() => {
          const allExpanded = Array.from(document.querySelectorAll('.proj')).every(p => p.classList.contains('expanded'));
          if (allExpanded) {
            projectsExpandAll.classList.add('all-expanded');
          } else {
            projectsExpandAll.classList.remove('all-expanded');
          }
        }, 50);
      });
    });
  }

})();
