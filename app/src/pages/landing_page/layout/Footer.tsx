import style from "../../../styles/layouts/Footer.module.css"
import logo from "../../../assets/logo.png"
import { Icon } from '@iconify/react'
import { useState } from 'react'

const Footer = () => {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter subscription
    console.log('Subscribing email:', email);
    setEmail('');
  };

  return (
    <div className={style.Footer} id="contact">
      {/* Newsletter Section */}
      <div className={style.newsletterSection}>
        <div className={style.newsletterContent}>
          <div className={style.newsletterText}>
            <h2 className={style.newsletterTitle}>Stay Connected with Connecta</h2>
            <p className={style.newsletterDescription}>
              Join thousands of freelancers and clients who get exclusive tips, job alerts, and platform updates delivered to their inbox.
            </p>
          </div>
          <form className={style.newsletterForm} onSubmit={handleSubscribe}>
            <div className={style.inputWrapper}>
              <Icon icon="mdi:email-outline" className={style.emailIcon} />
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={style.emailInput}
                required
              />
            </div>
            <button type="submit" className={style.subscribeBtn}>
              Subscribe
              <Icon icon="mdi:arrow-right" className={style.arrowIcon} />
            </button>
          </form>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className={style.footerMain}>
        <div className={style.footerGrid}>
          {/* Brand Column */}
          <div className={style.brandColumn}>
            <div className={style.logoContainer}>
              <img src={logo} alt="Connecta Logo" className={style.logoImage} />
            </div>
            <p className={style.brandText}>
              Connecta is an AI-powered freelance marketplace connecting talented professionals with clients worldwide. We make finding the right talent or the perfect gig simple, fast, and rewarding.
            </p>
            <div className={style.socialLinks}>
              <a href="https://x.com/Connectainc" target="_blank" rel="noopener noreferrer" className={style.socialIcon}><Icon icon="mdi:twitter" /></a>
              <a href="https://www.facebook.com/profile.php?id=61583324766005&mibextid=ZbWKwL" target="_blank" rel="noopener noreferrer" className={style.socialIcon}><Icon icon="mdi:facebook" /></a>
              <a href="https://www.tiktok.com/@connectainc?_r=1&_t=ZS-93OcUt3ckJW" target="_blank" rel="noopener noreferrer" className={style.socialIcon}><Icon icon="ic:baseline-tiktok" /></a>
              <a href="https://www.instagram.com/connecta_inc?igsh=MTA0NXhwY2sxZjNkeA==" target="_blank" rel="noopener noreferrer" className={style.socialIcon}><Icon icon="mdi:instagram" /></a>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className={style.linksColumn}>
            <h3 className={style.columnTitle}>For Freelancers</h3>
            <ul className={style.linksList}>
              <li><a href="#how-it-works">How It Works</a></li>
              <li><a href="#features">Features</a></li>
              <li><a href="#pricing">Pricing</a></li>
              <li><a href="/signup">Sign Up</a></li>
            </ul>
          </div>

          <div className={style.linksColumn}>
            <h3 className={style.columnTitle}>For Clients</h3>
            <ul className={style.linksList}>
              <li><a href="#how-it-works">Post a Job</a></li>
              <li><a href="#features">Find Talent</a></li>
              <li><a href="/signup">Get Started</a></li>
              <li><a href="#contact">Contact Us</a></li>
            </ul>
          </div>

          <div className={style.linksColumn}>
            <h3 className={style.columnTitle}>Company</h3>
            <ul className={style.linksList}>
              <li><a href="#about">About Us</a></li>
              <li><a href="#contact">Contact</a></li>
              {/* <li><a href="#careers">Careers</a></li> */}
              {/* <li><a href="#blog">Blog</a></li> */}
            </ul>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <hr className={style.horizontalLine} />
      <div className={style.footerBottom}>
        <p className={style.copyright}>© 2026 Connecta. All rights reserved.</p>
        <div className={style.legalLinks}>
          <span className="text-gray-400 text-sm">Privacy Policy</span>
          <span className="text-gray-400 text-sm">Terms of Service</span>
          <span className="text-gray-400 text-sm">Security</span>
          {/* <a href="#privacy">Privacy Policy</a>
          <a href="#terms">Terms of Service</a>
          <a href="#security">Security</a> */}
        </div>
      </div>
    </div>
  );
};

export default Footer;
