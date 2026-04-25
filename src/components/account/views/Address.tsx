import {Button, Card, CardBody} from "@heroui/react";

export const Address = () => {
  return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Address</h2>
          <Button color="primary" size="sm" radius="full">
            Add New Address
          </Button>
        </div>

        {/* 模拟地址卡片 */}
        <Card shadow="sm" className="border-none bg-default-50">
          <CardBody className="p-4 flex flex-row justify-between items-center">
            <div>
              <p className="font-bold">Home</p>
              <p className="text-sm text-default-500">123 Street Name, City, Country</p>
            </div>
            <Button size="sm" variant="flat">Default</Button>
          </CardBody>
        </Card>
      </div>
  );
};
