// import { GET_THEME_CUSTOMIZATION } from "@/graphql";
// import { graphqlRequest } from "../../lib/graphql-fetch";
import RenderThemeCustomization from "@components/home/RenderThemeCustomization";
import {ThemeCustomizationResponse} from "@/types/theme/theme-customization";

export const revalidate = 3600;

export default async function Home() {
  /*  const data = await graphqlRequest<ThemeCustomizationResponse>(GET_THEME_CUSTOMIZATION, {first: 20}, {
      tags: ["theme-customization"],
      life: "days"
    });*/
  const data = {
    "themeCustomizations": [
      {
        "id": "1",
        "type": "image_carousel",
        "name": "Hero Banner Carousel",
        "status": "1",
        "sortOrder": 1,
        "translations": [
          {
            "id": "trans-1",
            "themeCustomizationId": "1",
            "locale": "en",
            "options": {
              "images": [
                {
                  "image": "https://api-demo.bagisto.com/storage/theme/1/HRIEAfZ4vTc0hrW5G5L1tK3vzmwBXgZR781tjEwU.webp",
                  "link": "/search/women"
                },
                {
                  "image": "https://api-demo.bagisto.com/storage/theme/1/CoizBehgRZ4vqmV1gw88HiJWnx16BVorCpRxaBSb.webp",
                  "link": "/search/men"
                }
              ]
            }
          }
        ]
      },
      {
        "id": "2",
        "type": "product_carousel",
        "name": "Featured Products",
        "status": "1",
        "sortOrder": 2,
        "translations": [
          {
            "id": "trans-2",
            "themeCustomizationId": "2",
            "locale": "en",
            "options": {
              "title": "Featured Products",
              "filters": {"sort": "created_at", "order": "desc", "limit": "5"}
            }
          }
        ]
      },
      // {
      //   "id": "3",
      //   "type": "static_content",
      //   "name": "Offer Banner",
      //   "status": "1",
      //   "sortOrder": 3,
      //   "translations": [
      //     {
      //       "id": "trans-3",
      //       "themeCustomizationId": "3",
      //       "locale": "en",
      //       "options": {
      //         "html": "<div class='offer-banner'><a href='/search/sale'><img src='/images/offer-banner.webp' alt='Special Offer'/></a></div>"
      //       }
      //     }
      //   ]
      // },
      {
        "id": "4",
        "type": "category_carousel",
        "name": "Shop by Category",
        "status": "1",
        "sortOrder": 4,
        "translations": [
          {
            "id": "trans-4",
            "themeCustomizationId": "4",
            "locale": "en",
            "options": {
              "title": "Shop By Category",
              "filters": {"limit": "8"}
            }
          }
        ]
      },
      {
        "id": "3",
        "type": "product_carousel",
        "name": "New Products",
        "status": "1",
        "sortOrder": 5,
        "translations": [
          {
            "id": "trans-2",
            "themeCustomizationId": "2",
            "locale": "en",
            "options": {
              "title": "Featured Products",
              "filters": {"sort": "created_at", "order": "desc", "limit": "8"}
            }
          }
        ]
      },

    ]
  } as unknown as ThemeCustomizationResponse;

  return (
    <RenderThemeCustomization themeCustomizations={data?.themeCustomizations} />
  );
}