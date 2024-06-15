$(document).ready(function () {
  let itemsRaw = [];

  getData(itemsRaw, function (data) {
    itemsRaw = data;
  });

  let comments = [];
  $("#display").on("click", "li.bookItem", function () {
    $("#detailTitle").html(
      "<b>" +
        itemsRaw[this.id].title +
        "</b> (id: " +
        itemsRaw[this.id]._id +
        ")"
    );

    getComments(this.id, itemsRaw, function (data) {
      comments = data;
    });
  });

  $("#bookDetail").on("click", "button.deleteBook", function () {
    $.ajax({
      url: "/api/books/" + this.id,
      type: "delete",
      success: function (data) {
        //update list
        $("#detailComments").html(
          '<p class="text-center  text-danger fw-bolder">' +
            data +
            "</p><a href='/'><button class='btn btn-primary d-block mx-auto'>Refresh the page</button></a>"
        );
        getData(itemsRaw, function (data) {
          itemsRaw = data;
        });
      },
    });
  });

  $("#bookDetail").on("submit", "form", function (e) {
    e.preventDefault();

    let newComment =
      "<div class='text-center text-decoration-underline fw-bold'>New Comment: " +
      $("#commentToAdd").val() +
      "</div>";
    $.ajax({
      url: "/api/books/" + $(this).attr("data-id"),
      type: "post",
      dataType: "json",
      data: $("#newCommentForm").serialize(),
      success: function () {
        comments.unshift(newComment); //adds new comment to top of list
        $("#detailComments").html(comments.join(""));
        getData(itemsRaw, function (data) {
          itemsRaw = data;
        });
      },
    });
  });

  $("#newBookForm").on("submit", function (event) {
    event.preventDefault();
    $.ajax({
      url: "/api/books",
      type: "post",
      dataType: "json",
      data: $("#newBookForm").serialize(),
      success: function (data) {
        //update list
        getData(itemsRaw, function (response) {
          itemsRaw = response;
        });
        $("#newBookForm").trigger("reset");
      },
    });
  });

  $("#deleteAllBooks").click(function () {
    $.ajax({
      url: "/api/books",
      type: "delete",
      success: function (data) {
        //update list
        getData(itemsRaw, function (response) {
          itemsRaw = response;
        });

        $("#bookDetail").html(`
          <p
            id="detailTitle"
            class="text-center my-0 py-3 fw-bold border border-primary"
          >
            Select a book to see it's details and comments below:
          </p>
          <ul id="detailComments" class="py-3 mb-0 px-0">
            <div class="text-center">Comments will go here</div>
          </ul>`);
      },
    });
  });
  /*
   *  For #sampleposting to update form action url to test inputs book id
   */
  $("#commentTest").submit(function () {
    let id = $("#idinputtest").val();
    $(this).attr("action", "/api/books/" + id);
  });
});

function getComments(id, itemsRaw, cb) {
  let comments = [];
  $.getJSON("/api/books/" + itemsRaw[id]._id, function (data) {
    comments = [];
    $.each(data.comments, function (i, val) {
      comments.push("<li class='ms-5'>" + (i + 1) + "." + val + "</li>");
    });
    comments.push(
      '<br><form id="newCommentForm" data-id=' +
        data._id +
        '><input type="text" class="form-control" id="commentToAdd" name="comment" placeholder="Add New Comment here" required>'
    );
    comments.push(
      '<br><div class="d-flex justify-content-center gap-2 flex-wrap"><button class="btn btn-success addComment" type="submit" ">Add Comment</button>'
    );
    comments.push(
      '<button class="btn btn-danger deleteBook" id="' +
        data._id +
        '">Delete Book</button></div></form>'
    );

    $("#detailComments").html(comments.join(""));
    cb(comments);
  });
}

function getData(itemsRaw, cb) {
  $.getJSON("/api/books", function (data) {
    let items = [];
    itemsRaw = data;
    $.each(data, function (i, val) {
      items.push(
        '<li class="bookItem mb-3" id="' +
          i +
          '">' +
          val.title +
          " - " +
          val.commentcount +
          " comments</li>"
      );
      return i !== 14;
    });
    if (items.length >= 15) {
      items.push("<p>...and " + (data.length - 15) + " more!</p>");
    }
    $("#display").html(
      "<h4 class='text-center mt-3 fw-bold text-decoration-underline py-3'>Books List</h4>"
    );
    $("<ul/>", {
      class: "listWrapper",
      html: items.join(""),
    }).appendTo("#display");

    cb(itemsRaw);
  });
}
