
import beirut from '../assets/beirut.png';
import tripoli from '../assets/Tripoli.png';
import saida from '../assets/saida.png';
import tyre from '../assets/tyre.png';
import zahle from '../assets/zahle.png';
import '../styles/Branches.css'; 
const Branches = () => {
    return (
        <>
      <main class = "main-branches">
      <div class="cards-container">
  <div class="cards-scroller">
    <div class="card">
      <img src={beirut} class="card-img-top" alt="..."/>
      <div class="card-body">
        <p class="card-text">Beirut Branch – Proudly serving the capital, our flagship Shawarma King branch delivers unbeatable taste.</p>
      </div>
    </div>
    <div class="card">
      <img src={tripoli} class="card-img-top" alt="..."/>
      <div class="card-body">
        <p class="card-text">Proudly serving Tripoli  our second Shawarma King branch brings bold flavor to the heart of the North!</p>
      </div>
    </div>
    <div class="card">
      <img src={saida} class="card-img-top" alt="..."/>
      <div class="card-body">
        <p class="card-text">Proudly serving the South, our Shawarma King branch brings authentic flavor to Sidon's history.</p>
      </div>
    </div>
        <div class="card">
      <img src={tyre} class="card-img-top" alt="..."/>
      <div class="card-body">
        <p class="card-text">Our Shawarma King tyre branch brings Phoenician-inspired flavors to Tyre's ancient seaside streets!</p>
      </div>
    </div>        
    <div class="card">
      <img src={zahle} class="card-img-top" alt="..."/>
      <div class="card-body">
        <p class="card-text">Proudly serving the Bekaa Valley, our  branch brings sizzling flavor to Zahle's vibrant mountain charm!</p>
      </div>
    </div>
  </div>
</div>
</main>
        </>  
    );
}
export default Branches