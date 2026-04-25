// @/views/ordersContent.tsx
import {Tab, Table, TableBody, TableColumn, TableHeader, Tabs} from "@heroui/react";

export const Orders = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Orders</h2>

      <Tabs variant="underlined" color="primary">
        <Tab key="all" title="All Orders"/>
        <Tab key="processing" title="Processing"/>
        <Tab key="completed" title="Completed"/>
      </Tabs>

      <Table aria-label="Orders table" removeWrapper>
        <TableHeader>
          <TableColumn>ORDER ID</TableColumn>
          <TableColumn>DATE</TableColumn>
          <TableColumn>STATUS</TableColumn>
          <TableColumn>TOTAL</TableColumn>
        </TableHeader>
        <TableBody emptyContent={"No orders found"}>
          {[]}
        </TableBody>
      </Table>
    </div>
);
