"use client";

import { useEffect } from "react";

export default function MobileMetaTags() {
  useEffect(() => {
    // Add iOS meta tags dynamically
    const addMetaTag = (name: string, content: string, attribute: string = "name") => {
      if (document.querySelector(`meta[${attribute}="${name}"]`)) return;
      const meta = document.createElement("meta");
      meta.setAttribute(attribute, name);
      meta.setAttribute("content", content);
      document.head.appendChild(meta);
    };

    const addLinkTag = (rel: string, href: string, sizes?: string, media?: string) => {
      const existing = document.querySelector(`link[rel="${rel}"][href="${href}"]`);
      if (existing) return;
      const link = document.createElement("link");
      link.setAttribute("rel", rel);
      link.setAttribute("href", href);
      if (sizes) link.setAttribute("sizes", sizes);
      if (media) link.setAttribute("media", media);
      document.head.appendChild(link);
    };

    // iOS Meta Tags
    addMetaTag("apple-mobile-web-app-capable", "yes");
    addMetaTag("apple-mobile-web-app-status-bar-style", "default");
    addMetaTag("apple-mobile-web-app-title", "Shop Crazy");
    addMetaTag("mobile-web-app-capable", "yes");
    addMetaTag("theme-color", "#9333ea");
    addMetaTag("application-name", "Shop Crazy");
    addMetaTag("format-detection", "telephone=no");

    // Apple Touch Icons
    addLinkTag("apple-touch-icon", "/icons/icon-57x57.png", "57x57");
    addLinkTag("apple-touch-icon", "/icons/icon-60x60.png", "60x60");
    addLinkTag("apple-touch-icon", "/icons/icon-72x72.png", "72x72");
    addLinkTag("apple-touch-icon", "/icons/icon-76x76.png", "76x76");
    addLinkTag("apple-touch-icon", "/icons/icon-114x114.png", "114x114");
    addLinkTag("apple-touch-icon", "/icons/icon-120x120.png", "120x120");
    addLinkTag("apple-touch-icon", "/icons/icon-144x144.png", "144x144");
    addLinkTag("apple-touch-icon", "/icons/icon-152x152.png", "152x152");
    addLinkTag("apple-touch-icon", "/icons/icon-180x180.png", "180x180");

    // iOS Splash Screens
    addLinkTag(
      "apple-touch-startup-image",
      "/splash/iphone-6-7-8.png",
      undefined,
      "(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)"
    );
    addLinkTag(
      "apple-touch-startup-image",
      "/splash/iphone-6-7-8-plus.png",
      undefined,
      "(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3)"
    );
    addLinkTag(
      "apple-touch-startup-image",
      "/splash/iphone-x-xs.png",
      undefined,
      "(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)"
    );
    addLinkTag(
      "apple-touch-startup-image",
      "/splash/iphone-xr.png",
      undefined,
      "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)"
    );
    addLinkTag(
      "apple-touch-startup-image",
      "/splash/iphone-xs-max.png",
      undefined,
      "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)"
    );
    addLinkTag(
      "apple-touch-startup-image",
      "/splash/ipad.png",
      undefined,
      "(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2)"
    );
    addLinkTag(
      "apple-touch-startup-image",
      "/splash/ipad-pro.png",
      undefined,
      "(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)"
    );
  }, []);

  return null;
}

