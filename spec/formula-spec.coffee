describe "LanguageFormula", ->
  beforeEach ->
    waitsForPromise ->
      atom.packages.activatePackage 'language-formula'
