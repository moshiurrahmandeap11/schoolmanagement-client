import React from 'react';
import Banner from './Banner/Banner';
import Recently from './Recently/Recently';
import HistorySchool from './HistorySchool/HistorySchool';

const Home = () => {
    return (
        <div>
            <Banner></Banner>
            <Recently></Recently>
            <HistorySchool></HistorySchool>
        </div>
    );
};

export default Home;