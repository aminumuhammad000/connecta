import style from "../../../styles/layouts/Footer.module.css"
import logo from "../../../assets/logo.png"
import { useNavigate } from 'react-router-dom'

const Footer = () => {
  const navigate = useNavigate();

  return (
    <div className={style.Footer}>
      <div className={style.logoContainer} id="flexCenter">
        <img src={logo} alt="logo" />
      </div>
      <p className={style.text} id="smallText">
        Li Europan lingues es membres del sam familie. Lor separat existentie es
        un myth.
      </p>

      <hr className={style.horizontalLine} />
      <div className={style.copyContainer} id="flexBetween">
        <p>Copyright © 2025. All rights reserved.</p>

        <div className={style.copy} id="flexCenter">
          <p>Privacy</p>
          <p>Terms and condition</p>
          <button className="security" onClick={() => navigate('/dashboard')}>Security</button>
        </div>
      </div>
    </div>
  );
};

export default Footer;
