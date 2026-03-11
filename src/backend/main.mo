import List "mo:core/List";
import Map "mo:core/Map";
import Order "mo:core/Order";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Array "mo:core/Array";

actor {
  type Tool = {
    id : Text;
    name : Text;
    slug : Text;
    description : Text;
    category : Text;
    tier : Text;
    iconName : Text;
  };

  module Tool {
    type Category = Nat;

    public func compareByCategory(tool1 : Tool, tool2 : Tool) : Order.Order {
      let category1 = getCategoryOrder(tool1.category);
      let category2 = getCategoryOrder(tool2.category);
      switch (Nat.compare(category1, category2)) {
        case (#equal) { Text.compare(tool1.name, tool2.name) };
        case (order) { order };
      };
    };

    func getCategoryOrder(category : Text) : Category {
      switch (category) {
        case ("Organize") { 0 };
        case ("Convert") { 1 };
        case ("Optimize") { 2 };
        case ("Security") { 3 };
        case ("Edit") { 4 };
        case ("Advanced") { 5 };
        case (_) { 6 };
      };
    };
  };

  let tools = List.fromArray<Tool>([
    {
      id = "1";
      name = "Merge PDF";
      slug = "merge-pdf";
      description = "Combine multiple PDF files into one.";
      category = "Organize";
      tier = "free";
      iconName = "merge";
    },
    {
      id = "2";
      name = "Split PDF";
      slug = "split-pdf";
      description = "Divide a PDF into multiple files.";
      category = "Organize";
      tier = "free";
      iconName = "split";
    },
    {
      id = "3";
      name = "Rotate PDF";
      slug = "rotate-pdf";
      description = "Rotate pages in your PDF documents.";
      category = "Organize";
      tier = "free";
      iconName = "rotate";
    },
    {
      id = "4";
      name = "Reorder Pages";
      slug = "reorder-pages";
      description = "Change the order of pages in PDFs.";
      category = "Organize";
      tier = "free";
      iconName = "reorder";
    },
    {
      id = "5";
      name = "PDF to Word";
      slug = "pdf-to-word";
      description = "Convert PDF files to editable Word documents.";
      category = "Convert";
      tier = "free";
      iconName = "word";
    },
    {
      id = "6";
      name = "PDF to Excel";
      slug = "pdf-to-excel";
      description = "Transform PDFs into Excel spreadsheets.";
      category = "Convert";
      tier = "free";
      iconName = "excel";
    },
    {
      id = "7";
      name = "PDF to PowerPoint";
      slug = "pdf-to-powerpoint";
      description = "Convert PDFs to PowerPoint presentations.";
      category = "Convert";
      tier = "free";
      iconName = "powerpoint";
    },
    {
      id = "8";
      name = "PDF to JPG";
      slug = "pdf-to-jpg";
      description = "Convert PDF pages to JPG images.";
      category = "Convert";
      tier = "free";
      iconName = "jpg";
    },
    {
      id = "9";
      name = "Word to PDF";
      slug = "word-to-pdf";
      description = "Convert Word documents to PDF.";
      category = "Convert";
      tier = "free";
      iconName = "word";
    },
    {
      id = "10";
      name = "JPG to PDF";
      slug = "jpg-to-pdf";
      description = "Create PDFs from JPG images.";
      category = "Convert";
      tier = "free";
      iconName = "jpg";
    },
    {
      id = "11";
      name = "Compress PDF";
      slug = "compress-pdf";
      description = "Reduce the file size of PDFs.";
      category = "Optimize";
      tier = "free";
      iconName = "compress";
    },
    {
      id = "12";
      name = "Repair PDF";
      slug = "repair-pdf";
      description = "Fix corrupted or damaged PDFs.";
      category = "Optimize";
      tier = "free";
      iconName = "repair";
    },
    {
      id = "13";
      name = "PDF to Grayscale";
      slug = "pdf-to-grayscale";
      description = "Convert PDFs to grayscale.";
      category = "Optimize";
      tier = "free";
      iconName = "grayscale";
    },
    {
      id = "14";
      name = "Flatten PDF";
      slug = "flatten-pdf";
      description = "Flatten layers in PDF documents.";
      category = "Optimize";
      tier = "free";
      iconName = "flatten";
    },
    {
      id = "15";
      name = "Protect PDF";
      slug = "protect-pdf";
      description = "Add encryption and passwords to PDFs.";
      category = "Security";
      tier = "free";
      iconName = "protect";
    },
    {
      id = "16";
      name = "Unlock PDF";
      slug = "unlock-pdf";
      description = "Remove encryption from PDFs.";
      category = "Security";
      tier = "free";
      iconName = "unlock";
    },
    {
      id = "17";
      name = "Add Watermark";
      slug = "add-watermark";
      description = "Insert watermarks into PDFs.";
      category = "Edit";
      tier = "free";
      iconName = "watermark";
    },
    {
      id = "18";
      name = "Remove Watermark";
      slug = "remove-watermark";
      description = "Erase watermarks from PDFs.";
      category = "Edit";
      tier = "free";
      iconName = "watermark";
    },
    {
      id = "19";
      name = "Add Page Numbers";
      slug = "add-page-numbers";
      description = "Insert page numbers into PDFs.";
      category = "Edit";
      tier = "free";
      iconName = "page_numbers";
    },
    {
      id = "20";
      name = "Edit Metadata";
      slug = "edit-metadata";
      description = "Modify PDF metadata information.";
      category = "Edit";
      tier = "free";
      iconName = "metadata";
    },
    {
      id = "21";
      name = "Sign PDF";
      slug = "sign-pdf";
      description = "Digitally sign PDF documents.";
      category = "Advanced";
      tier = "premium";
      iconName = "sign";
    },
    {
      id = "22";
      name = "Annotate PDF";
      slug = "annotate-pdf";
      description = "Add annotations to PDF files.";
      category = "Advanced";
      tier = "premium";
      iconName = "annotate";
    },
    {
      id = "23";
      name = "Compare PDFs";
      slug = "compare-pdfs";
      description = "Compare two PDF documents for differences.";
      category = "Advanced";
      tier = "premium";
      iconName = "compare";
    },
  ]);

  let usageStats = Map.empty<Text, Nat>();

  public query ({ caller }) func getToolBySlug(slug : Text) : async Tool {
    switch (tools.values().find(func(tool) { tool.slug == slug })) {
      case (?tool) { tool };
      case (_) { Runtime.trap("Tool " # slug # " does not exist.") };
    };
  };

  public query ({ caller }) func getToolsByCategory(category : Text) : async [Tool] {
    tools.values().toArray().filter(func(tool) { tool.category == category });
  };

  public query ({ caller }) func getAllTools() : async [Tool] {
    tools.toArray().sort(
      func(a, b) {
        switch (Text.compare(a.category, b.category)) {
          case (#equal) {
            Text.compare(a.name, b.name);
          };
          case (order) { order };
        };
      }
    );
  };

  public query ({ caller }) func getToolsByTier(tier : Text) : async [Tool] {
    tools.values().toArray().filter(func(tool) { tool.tier == tier });
  };

  public query ({ caller }) func getUsageStats() : async [(Text, Nat)] {
    usageStats.toArray();
  };
};
