import React from 'react';
import './NotFoundPage.css'
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthProvider';
import { use } from 'react';

const NotFound = () => {
    const navigate = useNavigate();
    const {role} = useAuth();
    const handleBack = () => {
        const currentRole = role?.toUpperCase() || "";
        if (currentRole === "PERSONAL") {
            navigate('/home');
        } else if (currentRole === "BUSINESS") {
            navigate('/employer/dashboard');
        } else if (currentRole === "ADMIN") {
            navigate('/admin/dashboard');
        } else {
            navigate('/home');
        }
    }

    return (
        <div className='wrap-universe overflow-y-hidden'>
            <div id='stars'></div>
            <div id='stars2'></div>
            <div id='stars3'></div>
            <div className="not-found-container">
                <div className="title-notfound">
                    <h1 className="not-found-title">4</h1>
                    <div class="section-banner">
                        <div id="star-1">
                            <div class="curved-corner-star">
                                <div id="curved-corner-bottomright"></div>
                                <div id="curved-corner-bottomleft"></div>
                            </div>
                            <div class="curved-corner-star">
                                <div id="curved-corner-topright"></div>
                                <div id="curved-corner-topleft"></div>
                            </div>
                        </div>

                        <div id="star-2">
                            <div class="curved-corner-star">
                                <div id="curved-corner-bottomright"></div>
                                <div id="curved-corner-bottomleft"></div>
                            </div>
                            <div class="curved-corner-star">
                                <div id="curved-corner-topright"></div>
                                <div id="curved-corner-topleft"></div>
                            </div>
                        </div>

                        <div id="star-3">
                            <div class="curved-corner-star">
                                <div id="curved-corner-bottomright"></div>
                                <div id="curved-corner-bottomleft"></div>
                            </div>
                            <div class="curved-corner-star">
                                <div id="curved-corner-topright"></div>
                                <div id="curved-corner-topleft"></div>
                            </div>
                        </div>

                        <div id="star-4">
                            <div class="curved-corner-star">
                                <div id="curved-corner-bottomright"></div>
                                <div id="curved-corner-bottomleft"></div>
                            </div>
                            <div class="curved-corner-star">
                                <div id="curved-corner-topright"></div>
                                <div id="curved-corner-topleft"></div>
                            </div>
                        </div>

                        <div id="star-5">
                            <div class="curved-corner-star">
                                <div id="curved-corner-bottomright"></div>
                                <div id="curved-corner-bottomleft"></div>
                            </div>
                            <div class="curved-corner-star">
                                <div id="curved-corner-topright"></div>
                                <div id="curved-corner-topleft"></div>
                            </div>
                        </div>

                        <div id="star-6">
                            <div class="curved-corner-star">
                                <div id="curved-corner-bottomright"></div>
                                <div id="curved-corner-bottomleft"></div>
                            </div>
                            <div class="curved-corner-star">
                                <div id="curved-corner-topright"></div>
                                <div id="curved-corner-topleft"></div>
                            </div>
                        </div>

                        <div id="star-7">
                            <div class="curved-corner-star">
                                <div id="curved-corner-bottomright"></div>
                                <div id="curved-corner-bottomleft"></div>
                            </div>
                            <div class="curved-corner-star">
                                <div id="curved-corner-topright"></div>
                                <div id="curved-corner-topleft"></div>
                            </div>
                        </div>
                    </div>
                    <h1 className="not-found-title">4</h1>
                </div>

                <p className="not-found-message">Oops! The page you were looking for does not exist.</p>
                <button
                    class="bg-white text-center w-48 rounded-2xl h-14 relative text-black text-xl font-semibold group"
                    type="button"
                    onClick={handleBack}
                >
                    <div
                        class="bg-green-400 rounded-xl h-12 w-1/4 flex items-center justify-center absolute left-1 top-[4px] group-hover:w-[184px] z-10 duration-500"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 1024 1024"
                            height="25px"
                            width="25px"
                        >
                            <path
                                d="M224 480h640a32 32 0 1 1 0 64H224a32 32 0 0 1 0-64z"
                                fill="#000000"
                            ></path>
                            <path
                                d="m237.248 512 265.408 265.344a32 32 0 0 1-45.312 45.312l-288-288a32 32 0 0 1 0-45.312l288-288a32 32 0 1 1 45.312 45.312L237.248 512z"
                                fill="#000000"
                            ></path>
                        </svg>
                    </div>
                    <p class="translate-x-2">Go Back</p>
                </button>
                <div id='stars'></div>
                <div id='stars2'></div>
                <div id='stars3'></div>
            </div>
        </div>
    );
};

export default NotFound;