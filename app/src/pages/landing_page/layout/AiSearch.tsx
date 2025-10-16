import { Icon } from "@iconify/react"
import styles from "../../../styles/layouts/AiSearch.module.css";
import aisearch from "../../../assets/aisearch.png";


const AiSearch = () => {
  return (
    <div className={styles.AiSearch}>
        <img src={aisearch} alt="ai image" className={styles.image}/>
        <p className={styles.description}>Connecta uses AI to match freelancers with the right projects helping freelancers grow and clients hire quickly.</p>
        
        <div className={styles.searchContainer}>
            <textarea name="search" placeholder="To begin, please provide a description of the task you require." className={styles.textarea}></textarea>
            <button className={styles.search}>Search <span><Icon  icon="mingcute:search-ai-line" className={styles.icon} /></span></button>
        </div>
    </div>
  )
}

export default AiSearch
