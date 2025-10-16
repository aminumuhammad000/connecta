import style from "../../../styles/layouts/Footer.module.css"
import logo from "../../../assets/logo.png"

const Footer = () => {
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
        </div>
      </div>
    </div>
  );
};

export default Footer;
