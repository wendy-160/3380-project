import React from 'react';
import './Services.css';

const Services = () => {
    const medicalServices = [
        { id: 1, type: 'primary', title: 'Primary Care Services' },
        { id: 2, type: 'obgyn', title: 'OB/GYN Services' },
        { id: 3, type: 'obgyn', title: 'Women\'s Health' },
        { id: 4, type: 'derm', title: 'Dermatology Services' },
        { id: 5, type: 'pediatric', title: 'Pediatric Services' },
        { id: 6, type: 'eye', title: 'Eye Care' },
        { id: 7, type: 'lab', title: 'Lab Services' },
        { id: 8, type: 'heart', title: 'Heart Care' },
        { id: 9, type: 'imaging', title: 'Imaging & Radiology' }
    ];
    const getGridClass = (type) => {
        switch(type) {
            case 'primary':
                return 'primary-grid';
            case 'obgyn':
                return 'obgyn-grid';
            default:
                return 'derm-grid';
        }
    };

    return (
        <section className="services-section">
            <div className="services-container">
                <div className="services-heading">
                    <h2>Our Services</h2>
                </div>
                {medicalServices.map(service => (
                    <div key={service.id} className={getGridClass(service.type)}>
                        <h3>{service.title}</h3>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default Services;