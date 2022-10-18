import React, { useState } from "react";
import { LocalBanner } from "../../../../models/data/Ads";
import FontIcon from "../../../UI/FontIcon";

interface BannerPreviewListProps {
  activeIndex: number;
  banners: LocalBanner[];
  onTabClick: (i: number) => void;
  onDelete: (i: number) => void;
}

const BannerPreviewList = (props: BannerPreviewListProps) => {
  return <ul className="nav nav-tabs banner-list">
    {
      props.banners.map((banner, i) => <li key={`banner-${i}`} className="nav-item">
        <div className={`nav-link${props.activeIndex === i ? " active" : ""}`}><span onClick={(e) => props.onTabClick(i)}>{banner.name}</span> <span onClick={(e) => { props.onDelete(i); }}><FontIcon name="remove" /></span></div>
      </li>)
    }
  </ul>;
}
export default BannerPreviewList;