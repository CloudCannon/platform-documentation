declare const Prism: {
  languages: Record<string, unknown>;
};

(function (Prism) {
  Prism.languages.cc_annotated = {
    comment: /#.+$/m,
  };

  Prism.languages.annotated = Prism.languages.cc_annotated;
})(Prism);
