import React from "react";

export default function ContentScroll({children}) {
    return (
        <div className="block-content-scroll">
            <div className="content-flex">
                <div className="content-text">
                    <div className="content-text-inner">
                        <h2>Content Scroll</h2>
                        <p>
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                        </p>
                    </div>
                </div>
                <div className="content-slide-image"></div>
            </div>
        </div>
    );
}