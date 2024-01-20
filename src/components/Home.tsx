import { useState, useEffect } from "react";

function Home() {
  const [size, setSize] = useState(window.innerWidth);

  const updateSize = () => {
    setSize(window.innerWidth);
  };

  useEffect(() => {
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  });

  return (
    <div className="homepage">
      <header>
        <div className="extra1"></div>
        <div className="extra2"></div>
        <div className="header-words-cont">
          <h1>
            Delicious <span className="orange">Food,</span>
          </h1>
          <h1>
            Delivered to your <span className="orange">Doorstep</span>
          </h1>
          <p>
            Order Your Favourite Food with Ease. Fast and Reliable Food Delivery
            at Your Doorstep.
          </p>

          <div className="search-container">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              className="bi bi-geo-alt"
              viewBox="0 0 16 16"
            >
              <path d="M12.166 8.94c-.524 1.062-1.234 2.12-1.96 3.07A31.493 31.493 0 0 1 8 14.58a31.481 31.481 0 0 1-2.206-2.57c-.726-.95-1.436-2.008-1.96-3.07C3.304 7.867 3 6.862 3 6a5 5 0 0 1 10 0c0 .862-.305 1.867-.834 2.94zM8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10z" />
              <path d="M8 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0 1a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
            </svg>
            <input
              type="text"
              name="restaurant"
              id="restaurant"
              placeholder="Find Restaurant"
            />
            {size >= 400 && <button type="submit">search</button>}
          </div>
          {size < 400 && <button className="search-button">Search</button>}
        </div>

        <div className="header-add-ons">
          <div className="square">
            <img src="../images/manwithfood.png" alt="." />
            <div className="semi-circle"></div>
          </div>
        </div>
      </header>

      <section className="section-order-now">
        <div className="order-now-words">
          <h1>Delicious Food,</h1>
          <h1>Delivered to Your Doorstep</h1>
          <p>
            Order Your Favourite Food with Ease: Fast and Reliable Food Delivery
            at Your Doorstep
          </p>
          <button>Order Now</button>
        </div>

        <div className="order-now-add-ons">
          <div className="circle">
            <img src="../images/manwithfood.png" alt="." />
          </div>
        </div>
      </section>

      <form action="/" method="post" className="newsletter">
        <h2>We share Hot deals weekly</h2>
        <p>Subscribe to our newletter</p>
        <div className="newsletter-mail-cont">
          <input
            type="text"
            name="nemail"
            id="nemail"
            placeholder="Enter your Email"
          />
          <button type="submit" className="orange">
            Subscribe
          </button>
        </div>
      </form>
    </div>
  );
}

export default Home;
