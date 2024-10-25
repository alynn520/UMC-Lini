import { addStore, getStoreById } from "../repositories/store.repository.js";
import { responseFromStore } from "../dtos/store.dto.js";

export const storeSignUp = async (data) => {
  const storeId = await addStore({
    name: data.name,
    address: data.address,
    phoneNumber: data.phoneNumber,
  });

  if (!storeId) {
    throw new Error("Store 등록에 실패했습니다.");
  }

  const store = await getStoreById(storeId);
  return responseFromStore({ store });
};
