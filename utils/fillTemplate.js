export const fillTemplate = (template = "", data = {}) => {
  return template.replace(/{{\s*(\w+)\s*}}/g, (match, key) => {
    return key in data ? data[key] : match;
  });
};
