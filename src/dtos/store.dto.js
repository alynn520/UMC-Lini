export const bodyToStore = (body) => {
  return {
    name: body.name,
    address: body.address,
    phoneNumber: body.phoneNumber || "",
  };
};

export const responseFromStore = (store) => {
  return {
    id: store.id,
    name: store.name,
    address: store.address,
    phoneNumber: store.phone_number,
    createdAt: store.created_at,
    updatedAt: store.updated_at,
  };
};
