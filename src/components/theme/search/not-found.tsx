"use client";

import {EventButton} from '@components/common/button/EventButton';
import NotFoundIcon from '@components/common/icons/NotFoundIcon';
import {useTranslations} from 'next-intl';

const NotFound = ({ msg }: { msg: string }) => {
  const t = useTranslations("notFound");
  
  return (
    <div className="my-12 px-4 flex flex-col flex-wrap items-center justify-center gap-y-4">
      <div>
        <NotFoundIcon />
      </div>

      <h1 className="mt-4 font-outfit text-2xl sm:text-3xl lg:text-4xl font-semibold">
        {t("title")}
      </h1>
      <p className="text-black/60 dark:text-white">{msg}</p>
      <EventButton buttonName={t("backToHome")} redirect="/"/>
    </div>
  );
};

export default NotFound;