exports.createUserInfoArr = (data, neededKeys) => {
  console.log({ data }, neededKeys);

  return Object.keys(data)
    .map((key) => {
      if (neededKeys.includes(key)) {
        return {
          [key]: data[key],
        };
      }

      return null;
    })
    .filter((key) => key !== null);
};
