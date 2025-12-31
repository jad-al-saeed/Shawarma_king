import '../styles/Hire.css'
const Hire = () => {
    return (
        <>
            <div className="main-hire">
                <div className="form-container">
                    <h1>JOIN THE<br />KINGS TEAM!</h1>
                    <p className="subtitle">Come join one of the leading hospitality groups in Lebanon!</p>

                    <form>
                        <label>
                            Name <span className="required">(required)</span>
                        </label>

                        <div className="name-fields">
                            <input type="text" placeholder="First Name" required />
                            <input type="text" placeholder="Last Name" required />
                        </div>

                        <label>
                            Email <span className="required">(required)</span>
                        </label>
                        <input type="email" required />

                        <label>
                            Desired Position <span className="required">(required)</span>
                        </label>
                        <textarea
                            rows="3"
                            placeholder="What position(s) are you interested in?"
                            required
                        ></textarea>

                        <label>Tell Us about Yourself</label>
                        <textarea
                            rows="4"
                            placeholder="What makes you want to join us?"
                        ></textarea>

                        <button type="submit">HIRE ME!</button>
                    </form>
                </div>
            </div>
        </>
    );
};

export default Hire;
