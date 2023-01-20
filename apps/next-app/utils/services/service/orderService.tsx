import { Context } from 'react';
import { OrderDataResponse } from 'types/orders';
import { Contextualizer } from 'utils/services//contextualizer';
import { ProvidedServices } from 'utils/services/providedServices';
import { axiosInstance } from 'utils/services/service/axiosService';

export interface IOrderService {
  getAllOrders(limit?: number, offset?: number): Promise<OrderDataResponse>;
}

export const OrderServiceContext: Context<
  IOrderService | undefined
> = Contextualizer.createContext(ProvidedServices.OrderService);

export const useOrderServices = () =>
  Contextualizer.use<IOrderService>(ProvidedServices.OrderService);

export const OrderService = ({ children }: any) => {
  const orderService = {
    async getAllOrders(
      limit: number = 0,
      offset: number = 0
    ): Promise<OrderDataResponse> {
      try {
        const response = await axiosInstance.get(
          `/orders?limit=${limit}&offset=${offset}`
        );

        return response.data;
      } catch (err) {
        console.log(err);
      }
    },
  };
  return (
    <OrderServiceContext.Provider value={orderService}>
      {children}
    </OrderServiceContext.Provider>
  );
};
