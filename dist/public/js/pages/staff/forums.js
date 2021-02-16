$(document).on('click', '.saveChangesCategory', function(e) {
    e.preventDefault();
    let subId = $(this).attr('data-id');
    let title = $('.forumCategoryTitle[data-id="'+subId+'"]').val();
    let desc = $('.forumCategoryDescription[data-id="'+subId+'"]').val();
    let weight = $(`.forumCategoryWeight[data-id="${subId}"]`).val();

    request('/staff/forum/category/'+subId, 'PATCH', {
        title: title,
        description: desc,
        weight: weight,
    })
    .then(d => {
        success('Category updated!');
    })
    .catch(e => {
        console.error(e);
    })
});

$(document).on('click', '.saveChangesSubCategory', function(e) {
    e.preventDefault();
    let subId = $(this).attr('data-id');
    let catId = $(`.subCategoryId[data-id="${subId}"]`).val();
    let title = $('.subCategoryTitle[data-id="'+subId+'"]').val();
    let desc = $('.subCategoryDescription[data-id="'+subId+'"]').val();
    let weight = $(`.subCategoryWeight[data-id="${subId}"]`).val();
    let readPermissionLevel = $(`.subCategoryPermissionsRead[data-id="${subId}"]`).val();
    let postPermissionLevel = $(`.subCategoryPermissionsPost[data-id="${subId}"]`).val();

    request('/staff/forum/sub-category/'+subId, 'PATCH', {
        title: title,
        description: desc,
        weight: weight,
        categoryId: catId,
        readPermissionLevel: readPermissionLevel,
        postPermissionLevel: postPermissionLevel,
    })
    .then(d => {
        success('Subcategory updated!');
    })
    .catch(e => {
        console.error(e);
    })
});

let subAddPending = false;
$(document).on('click', '#addSubCategory', function(e) {
    e.preventDefault();
    if (subAddPending) {
        subAddPending = false;
        $('#tbody-subcategories').children().last().remove();
        $('#addSubCategory').text('Add Subcategory');
        return;
    }
    subAddPending = true;
    $('#addSubCategory').text('Remove Subcategory');
    $('#tbody-subcategories').append(`
    
                    <tr>
                        <th scope="row"></th>
                        <td><input type="text" class="form-control addSubcategoryCategory" placeholder="Forum Category Id" value="1"></td>
                        <td><input type="text" class="form-control addSubCategoryTitle" placeholder="Forum Title" value=""></td>
                        <td><input type="text" class="form-control addSubCategoryDescription" placeholder="Forum Description" value="N/A"></td>
                        <td><input type="text" class="form-control addSubCategoryReadPermission" placeholder="Read Permissions" value="0"></td>
                        <td><input type="text" class="form-control addSubCategoryPostPermission" placeholder="Post Permissions" value="0"></td>
                        <td><input type="text" class="form-control addSubCategoryWeight" placeholder="Forum Weight" value="0"></td>
                        <td><button type="button" class="btn btn-success addSubcategorySubmit" style="width: 100%;">Save</button></td>
                    </tr>
    
    
    `);
});

let catAddPending = false;
$(document).on('click', '#addCategory', function(e) {
    e.preventDefault();
    if (catAddPending) {
        catAddPending = false;
        $('#tbody-categories').children().last().remove();
        $('#addCategory').text('Add Category');
        return;
    }
    catAddPending = true;
    $('#addCategory').text('Remove Category');
    $('#tbody-categories').append(`

    <tr>
        <th scope="row"></th>
        <td><input type="text" class="form-control addForumCategoryTitle" placeholder="Forum Category" value=""></td>
        <td><input type="text" class="form-control addForumCategoryDescription" placeholder="Forum Description" value=""></td>
        <td><input type="text" class="form-control addForumCategoryWeight" placeholder="Forum Weight"></td>
        <td><button type="button" class="btn btn-success addForumCategorySubmit" style="width: 100%;">Save</button></td>
    </tr>
    
    `);
});

$(document).on('click', '.addSubcategorySubmit', function(e) {
    e.preventDefault();
    let catId = $('.addSubcategoryCategory').val();
    let title = $('.addSubCategoryTitle').val();
    let desc = $('.addSubCategoryDescription').val();
    let read = $('.addSubCategoryReadPermission').val();
    let post = $('.addSubCategoryPostPermission').val();
    let weight = $('.addSubCategoryWeight').val();

    request('/staff/forum/sub-category/', 'PUT', {
        title: title,
        description: desc,
        weight: weight,
        categoryId: catId,
        readPermissionLevel: read,
        postPermissionLevel: post,
    })
    .then(d => {
        success('Subcategory created!', function() {
            window.location.reload();
        });
    })
    .catch(e => {
        console.error(e);
    })
});

$(document).on('click', '.addForumCategorySubmit', function(e) {
    e.preventDefault();
    let title = $('.addForumCategoryTitle').val();
    let desc = $('.addForumCategoryDescription').val();
    let weight = $('.addForumCategoryWeight').val();

    request('/staff/forum/category/', 'PUT', {
        title: title,
        description: desc,
        weight: weight,
    })
    .then(d => {
        success('Category created!', function() {
            window.location.reload();
        });
    })
    .catch(e => {
        console.error(e);
    })
});