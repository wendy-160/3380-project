import React from 'react';
import './AboutUs.css';

const About = () => {
    return (
        <div className="about-container">
            <section className="section">
            <h1 >About Us</h1>
                <p className="tagline-section">
                    We are a clinic committed to providing high-quality medical services to our patients. 
                    Our team of experienced doctors, nurses, and staff work together to offer personalized 
                    care, ensuring that each patient receives the attention and treatment they deserve. 
                    Whether you're here for a routine check-up or a specialized treatment, we prioritize 
                    your health and well-being above all else. Our goal is to make your visit as comfortable 
                    and efficient as possible, providing exceptional care in a compassionate environment.
                </p>
            </section>
            <section className="vision-section">
                <div className="container">
                    <h2>Our Values</h2>
                    <div className="values-grid">
                        <div className="value-card">
                                <h3>Integrity</h3>
                                <p>We exert professional and personal integrity in everuthing we do</p>
                            
                        </div>
                        <div className="value-card">
                                <h3>Compassion</h3>
                                <p>We approach every patient with empathy and respect</p>
                        </div>
                        <div className="value-card">
                                <h3>Excellence</h3>
                                <p>We strive for the highest standards in medical care</p>
                        </div>
                        <div className="value-card">
                                <h3>Collaboration</h3>
                                <p>We value external and internal teamwork because we can achieve so much more together</p>
                        </div>
                        <div className="value-card">
                                <h3>Community</h3>
                                <p>We value community service and prioritize serving and improving quality of life</p>
                        </div>
                        <div className="value-card">
                                <h3>Patient Care</h3>
                                <p>We prioritize a patient's needs and well-being</p>
                        </div>
                    </div>
                </div>
            </section>
            <section className="contact-section">
                <div className="container">
                    <h2>Contact Us</h2>
                    <div className="contact-content">
                        <div className="contact-info">
                            <div className="contact-item">
                                <div>
                                    <h3>Address</h3>
                                    <p>4302 University Dr<br />Houston, TX  77004</p>
                                </div>
                            </div>
                            <div className="contact-item">
                                <div>
                                    <h3>Phone</h3>
                                    <p>(123) 456-7890</p>
                                </div>
                            </div>
                            <div className="contact-item">
                                <div>
                                    <h3>Email</h3>
                                    <p>UHClinicHub@gmail.com</p>
                                </div>
                            </div>
                            <div className="contact-item">
                                <div>
                                    <h3>Hours</h3>
                                    <p>Monday - Friday: 7am - 7pm<br />Saturday: 8am - 8pm<br />Sunday: Closed</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default About;
