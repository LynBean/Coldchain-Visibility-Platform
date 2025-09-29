const tw = (strings: TemplateStringsArray, ...values: (string | number)[]) =>
  String.raw({ raw: strings }, ...values)

export default tw
