import React from "react";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);


export default function TextSlide({speedProps}) {
    const containerRef = useRef(null);
    const  wrapAll = (elements, wrapperHTML) => {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = wrapperHTML.trim();
        const wrapperElement = wrapper.firstChild;
      
        const parent = elements[0].parentNode;
        const referenceNode = elements[0];
      
        parent.insertBefore(wrapperElement, referenceNode);
      
        elements.forEach(el => wrapperElement.appendChild(el));
      }

      const  cloneAndAppend = (selector, targetSelector) =>{
        const elements = selector;
        const target = document.querySelector(targetSelector);
      
        elements.forEach(el => {
          const clone = el.cloneNode(true); // true pour cloner les enfants aussi
          target.appendChild(clone);
        });
      }
      const setupTicker = (elements) =>
        {
            const span_element = elements.querySelectorAll('span');
            const span_array = [...span_element];
            const wrapperHTML = `<div class="wrapper-setup-ticker"></div>`;
            wrapAll(span_array, wrapperHTML);
            const wrapper = elements.querySelector('.wrapper-setup-ticker');

            const wrapper_width = wrapper.offsetWidth;
            let speed = 15;
            let proxy = {timeScale : 0};
            let  pipe = gsap.utils.pipe(gsap.utils.clamp(-10, 10),gsap.utils.snap(0.125));
            
            const tl = gsap.timeline({
                repeat: -1,
                onReverseComplete: () => {
                    tl.iteration(10);
                },
                ScrollTrigger:{
                    pinnedContainer: ".scrolltriger",
                    trigger: ".container-fluid",
                    start: "top bottom",
                    end: "bottom top",
                    toggleActions:"play pause resume pause",
                    onUpdate: (self) => {
                        proxy.timeScale = gsap.utils.mapRange(0, self.end, 0, speedProps);
                        gsap.to(proxy, {
                            timeScale: 0,
                            ease: "none",
                            duration: 0.5,
                            overwrite: true
                        });

                        let timeScaleFactor = pipe(self.getVelocity() / 100);
                        if (Math.abs(timeScaleFactor) > Math.abs(proxy.timeScale)) {
                            proxy.timeScale = timeScaleFactor;
                            gsap.to(proxy, {
                                timeScale: self.direction,
                                duration: 1.5,
                                ease: "power3",
                                overwrite: true,
                                onUpdate: () => {
                                    gsap.to(tl, {timeScale: proxy.timeScale, ease:"power3", duration: 0.5});
                                }
                            });
                        }
                    }
                }
            });
            cloneAndAppend(wrapper.querySelectorAll('span'), '.wrapper-setup-ticker');
            tl.to(wrapper, {
                rotation: 0.01,
                force3D: true,
                xPercent: -50,
                ease: "none",
                duration: 500 / speedProps
            })
        }
    useEffect(() => {  
        if (!containerRef.current) return;
        setupTicker(containerRef.current);
     }, [setupTicker]);

    return (
        <div className=" scrolltriger">
            <div  className="backgroud-text">
                <div ref={containerRef} className="text-animate container-fluid">
                    <span> Ctrlweb</span>
                    <span> Agence web</span>
                    <span> qui nous rend heureux ✌🏾</span>
                </div>
            </div>
        </div>
    );
}