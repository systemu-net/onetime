import { useState } from 'react';

const Shorten = () => {
  const [url, setUrl] = useState('');

  return (
    <section className="shorten">
      <div className="container">
        {/* Shorten content */}
        <div className="shorten__content">
          <form action="" className="form">
            <div className="input-control">
              <input type="text" placeholder='Shorten a link' />
              <p className="error-text">Please add a link</p>
            </div>

            <button className="btn" datatype="wide">Shorten It!</button>
          </form>
        </div>

        {/* Shorten Output */}
        <div className="shorten__cards">
          {/* Shorten Card */}
          <div className="shorten__card">
            <div className="actual__link">
              <span>https://www.frontendmentor.com/</span>
            </div>

            <hr className="line" />

            <div className="shorten__link">
              <a href="#" target="_blank">https://toss.so/6EQ</a>
              <button className="btn" datatype="wide">Copy</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Shorten;