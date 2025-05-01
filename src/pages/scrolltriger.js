import React , {useEffect , useRef} from "react";
import Scroll from "@/components/layouts/Scroll";
import TextSlide from "@/components/TextSlide";
import ContentScroll from "@/components/blocks/ContentScroll";
export default function ScrollTriger() {
   
    return (
        <Scroll>
            <div className="page-content">
                <TextSlide speedProps={15}/>
                <ContentScroll />
            </div>
        </Scroll>
    );
}