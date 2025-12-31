import '../styles/Home.css';

const Home = () => {
  return (
    <>
      <main class = "main-home">
        <div className="center-wrap">
          <div className="overlay">
            <h1>Welcome to Shawarma King</h1>
            <p>
              At Shawarma King, we serve royalty in every bite. Our mouthwatering shawarmas are crafted with rich
              spices, tender cuts, and a passion for flavor that rules above all. Taste the crown jewel of street food –
              only at Shawarma King.
            </p>
            <div className="button">
              <a href="/menu">Menu</a>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Home;
