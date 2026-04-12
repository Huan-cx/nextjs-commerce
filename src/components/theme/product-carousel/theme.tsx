import {FC} from "react";
import {NOT_IMAGE} from "@/utils/constants";
import {ProductCard} from "@/components/catalog/product/ProductCard";
import {Spu} from "@/types/api/product/type";

const Theme: FC<{
  products: Spu[];
  name: string;
}> = ({ products, name }) => {
  return (
    <section>
      <div className="md:max-w-4.5xl mx-auto mb-6 w-full px-0 text-center xss:mb-10 md:px-36">
        <h2 className="mb-2 text-[28px] font-semibold text-black dark:text-white xss:mb-4 xss:text-4xl">
          {name}
        </h2>
        <p className="font-normal text-black/60 dark:text-neutral-300 text-lg">
          Discover the latest trends! Fresh products just added—shop new styles,
          tech, and essentials before they&apos;re gone.
        </p>
      </div>

      <div className="w-full pb-6 pt-1">
        <ul className="m-0 grid grid-cols-2 justify-center gap-6 p-0 xss:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:gap-6 xl:gap-[46px]">
          {products.map((product, index) => {
            return (
              <ProductCard
                key={index}
                currency={"USD"}
                imageUrl={product.picUrl || NOT_IMAGE}
                price={product?.price || "0"}
                product={product}
                priority={index < 4}
              />
            );
          })}
        </ul>
      </div>
    </section>
  );
};

export default Theme;
