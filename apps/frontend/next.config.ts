// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   images: {
//     remotePatterns: [
//       // 🖼️ Common image sources
//       { protocol: "https", hostname: "images.unsplash.com" },
//       { protocol: "https", hostname: "picsum.photos" },
//       { protocol: "https", hostname: "encrypted-tbn0.gstatic.com" },

//       // 🛒 E-commerce & CDN sources
//       { protocol: "https", hostname: "m.media-amazon.com" },
//       { protocol: "https", hostname: "rukminim2.flixcart.com" },
//       { protocol: "https", hostname: "static.wixstatic.com" },
//       { protocol: "https", hostname: "cdn.myshop.in" },
//       { protocol: "https", hostname: "myecom-storage.s3.amazonaws.com" },
//       { protocol: "https", hostname: "cdn.shopify.com" },
//       { protocol: "https", hostname: "content.shop4reebok.com" },
//       { protocol: "https", hostname: "assets.adidas.com" },
//       { protocol: "https", hostname: "static.nike.com" },
//       { protocol: "https", hostname: "assets.puma.com" },
//       { protocol: "https", hostname: "images.lifestylelabels.com" },
//       { protocol: "https", hostname: "cdn.zara.net" },
//       { protocol: "https", hostname: "zara.scene7.com" },

//       // 💻 Electronics brands
//     // 🍎 Electronics brands
// {
//   protocol: "https",
//   hostname: "images.samsung.com",
// },
// {
//   protocol: "https",
//   hostname: "store.storeimages.cdn-apple.com",
// },
// {
//   protocol: "https",
//   hostname: "www.apple.com",
// },
// {
//   protocol: "https",
//   hostname: "images.philips.com",
// },
// {
//   protocol: "https",
//   hostname: "cdn.whirlpool.com",
// },
// {
//   protocol: "https",
//   hostname: "www.godrejappliances.com",
// },
// {
//   protocol: "https",
//   hostname: "ik.imagekit.io",
// },
// {
//   protocol: "https",
//   hostname: "www.sony.com",
// },


//       // 🏠 Appliances & furniture
//       { protocol: "https", hostname: "cdn.whirlpool.com" },
//       { protocol: "https", hostname: "www.godrejappliances.com" },
//       { protocol: "https", hostname: "ik.imagekit.io" },

//       // 🏷️ Fashion brands
//       { protocol: "https", hostname: "assets.myntassets.com" },
//       { protocol: "https", hostname: "img.ltwebstatic.com" },
//       { protocol: "https", hostname: "assets.hm.com" },
//       { protocol: "https", hostname: "www2.hm.com" },
//       { protocol: "https", hostname: "assets.ajio.com" },
//       { protocol: "https", hostname: "static.pullandbear.net" },

//       // 🛍️ Others
//       { protocol: "https", hostname: "res.cloudinary.com" },
//       { protocol: "https", hostname: "storage.googleapis.com" },
//       { protocol: "https", hostname: "firebasestorage.googleapis.com" },
//        { protocol: "https", hostname: "assets.aboutamazon.com" },
//     ],
//   },
// };

// export default nextConfig;



import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;