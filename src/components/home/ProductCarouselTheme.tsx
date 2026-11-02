import {ProductCard} from "@components/catalog/product/ProductCard";
import {ProductsSectionProps} from "@components/catalog/type";

const Theme = ({ title, description, products }: ProductsSectionProps) => {
  return (
    <section className="pt-8 sm:pt-12 lg:pt-20">
      <div className="md:max-w-4.5xl mx-auto mb-6 w-full px-0 text-center xss:mb-10 md:px-36">
        <h2 className="mb-4 font-outfit text-xl md:text-4xl font-semibold text-black dark:text-white">
          {title}
        </h2>
        <p className="text-sm md:text-base font-normal text-black/60 dark:text-neutral-300">
          {description}
        </p>
      </div>

      <div className="w-full pb-6 pt-1">
        <ul className="m-0 grid grid-cols-2 justify-center gap-5 lg:gap-11.5 p-0 xss:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {products.map((item, index) => {
            return (
              <ProductCard
                key={item.id ?? index}
                currency="USD"
                  // imageUrl={imageUrl || ""}
                product={item}
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
