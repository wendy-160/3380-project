
import React from 'react';
import doc from '../../assets/doc.png';
import './Languages.css';

const Languages = () => {
    const languagesList = [
        'Arabic', 'Spanish', 'Mandarin', 'Korean', 
        'Vietnamese', 'American Sign Language', 'French',
        'Japanese', 'German', 'Russian'
    ];
    
    return (
        <div className="languages-card">
            <div className="languages">
                <div className="languages-left">
                    <img src={doc} alt="Language services document" className="doc" />
                </div>
                <div className="languages-right">
                    <h2>LANGUAGES</h2>
                    <p>
                        We offer professional translation and interpretation services in a wide range of languages
                    </p>
                    <div className="language-list">
                        {languagesList.map((language, index) => (
                            <span key={index} className="language-tag">
                                {language}
                            </span>
                        ))}
                        <span className="language-tag">And more...</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Languages;