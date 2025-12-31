import { Link } from 'react-router-dom';
import '../styles/About.css';
import Family from '../assets/Family.jpg';

const About = () => {
  return (
    <>
      <div className="container-fluid">
        <div className="row">

          <div className="left-panel">
            <h1>WHO ARE WE?</h1>
            <p>
              <strong>Shawarma King</strong> is a leading shawarma brand, loved for its
              authentic flavors, original recipes, and top-notch service. Every day,
              customers enjoy our handcrafted shawarmas made with high-quality ingredients
              and rich tradition.
            </p>

            <p>
              We're expanding across Lebanon, bringing our signature taste to more
              communities. From fresh sandwiches to salads and more, 
               Shawarma King is your go-to spot for fast, flavorful food.
            </p>

            <p>
              Born from a passion for Middle Eastern street food, we're committed to
              quality, consistency, and a taste that truly rules.
            </p>
          </div>

          <div className="right-panel">
            <div className="content-box">
              <p className="vision-text">
                "At Shawarma King, we don't just serve food — we serve royalty in every wrap."
              </p>

              <p className="h5">Check out our branches:</p>

              <Link to="/Branches">Our Branches</Link>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};
export default About;