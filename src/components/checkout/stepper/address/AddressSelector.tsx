import {AddressLine} from "@/types/api/address/type";
import {Card, CardBody, Radio, RadioGroup} from "@heroui/react";

export const AddressSelector = ({
                                  title,
                                  addresses,
                                  selectedAddress,
                                  onSelect,
                                }: {
  title: string;
  addresses: AddressLine[];
  selectedAddress: AddressLine | null;
  onSelect: (address: AddressLine | null) => void;
}) => (
    <div className="space-y-2">
      {title && <h4 className="text-sm font-medium text-default-600 mb-2">{title}</h4>}
      {addresses.length > 0 ? (
          <RadioGroup
              value={selectedAddress?.id?.toString() || ''}
              onValueChange={(value) => {
                const address = addresses.find(a => a.id.toString() === value);
                onSelect(address || null);
              }}
              className="space-y-2"
          >
            {addresses.map(address => {
              const isSelected = selectedAddress?.id === address.id;
              return (
                  <Card
                      key={address.id}
                      isPressable
                      className={`transition-all duration-200 border-2 ${
                          isSelected
                              ? 'border-primary bg-primary-50 shadow-md'
                              : 'border-default-200 hover:border-primary-300 hover:shadow-sm'
                      }`}
                      onPress={() => {
                        // 点击卡片任意位置都触发选择
                        onSelect(isSelected ? null : address);
                      }}
                  >
                    <CardBody className="p-4 cursor-pointer">
                      <div className="flex items-start gap-3">
                        <Radio
                            value={address.id.toString()}
                            className="mt-0.5"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-default-800">
                              {address.firstName} {address.lastName}
                            </p>
                            {address.companyName && (
                                <span className="text-xs font-medium text-default-500">
                                  ({address.companyName})
                                </span>
                            )}
                          </div>
                          <p className="text-sm text-default-600 line-clamp-2">
                            {address.address}, {address.city}, {address.state}, {address.country} {address.postcode}
                          </p>
                          {address.phone && (
                              <p className="text-xs text-default-400 mt-1">
                                Phone: {address.phone}
                              </p>
                          )}
                        </div>
                      </div>
                    </CardBody>
                  </Card>
              );
            })}
          </RadioGroup>
      ) : (
          <div className="text-center py-6 px-4 bg-default-50 rounded-lg border border-dashed border-default-300">
            <p className="text-sm text-default-400">No saved addresses available</p>
          </div>
      )}
    </div>
);