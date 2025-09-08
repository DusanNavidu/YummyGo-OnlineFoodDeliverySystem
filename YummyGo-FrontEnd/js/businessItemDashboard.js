$(document).ready(async function () {
    console.log("Main Business select Dashboard is ready");

    const backendUrl = "http://localhost:8080";
    const urlParams = new URLSearchParams(window.location.search);
    const businessId = urlParams.get('businessId');

    if (!businessId) {
        alert("Business not selected!");
        return;
    }

    $('#logoutBtn').click(async function () {
        try {
            await cookieStore.delete('token');
            await cookieStore.delete('username');
            window.location.href = '/index.html';
        } catch (error) {
            console.error('Error during logout:', error);
            window.location.href = '/index.html';
        }
    });

    $('#businessId').val(businessId);
    console.log("Business ID from URL:", businessId);

    async function loadBusinesProfile() {
        try {
            const token = (await cookieStore.get('token'))?.value;

            $.ajax({
                url: `${backendUrl}/api/v1/business/getBusinessProfile/${businessId}`,
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                },
                success: function(response) {
                    const business = response.data; // Access the data object

                    if (business) {
                        $('#business-name-profile').text(business.businessName);
                        $('#business-location-profile').text(business.businessAddress);
                        $('#business-open-time-profile').text(business.openTime);
                        $('#business-close-time-profile').text(business.closeTime);
                        $('#business-contact1-profile').text(business.contactNumber1);
                        $('#business-contact2-profile').text(business.contactNumber2);

                        if (business.businessLogo) {
                            $('#business-logo-profile').html(`<img src="${backendUrl}${business.businessLogo}" 
                                alt="Business Logo" class="img-fluid rounded-circle p-2 border mb-3" style="width: 200px; height: 200px; object-fit: contain;">`);
                        } else {
                            $('#business-logo-profile').html(`<p>No logo available</p>`);
                        }
                    } else {
                        console.warn("No business data found!");
                    }
                },
                error: function(xhr, status, error) {
                    console.error("Error fetching business profile:", error);
                }
            });

        } catch (err) {
            console.error("Error fetching token or items:", err);
        }
    }
    loadBusinesProfile();

    // =========================
    // Load Business Items
    // =========================
    async function loadBusinessItems() {
        try {
            const token = (await cookieStore.get('token'))?.value;

            $.ajax({
                url: `${backendUrl}/api/v1/item/getAllThisBusinessItems/${businessId}`,
                method: 'GET',
                headers: token ? { 'Authorization': 'Bearer ' + token } : {},
                success: function (response) {
                    const container = $('#business-items-container');
                    container.empty();

                    if (!response.data || response.data.length === 0) {
                        container.append('<p>No items found for this business.</p>');
                        return;
                    }

                    response.data.forEach((item) => {
                        const isAvailable = item.itemAvailability === 'Available';
                        const btnClass = isAvailable ? 'btn-success' : 'btn-danger';
                        const btnText = isAvailable ? 'Available' : 'Unavailable';

                        container.append(`
                            <div class="col-12 col-sm-6 col-md-4 col-lg-3 col-xl-2">
                                <div class="card h-100 p-2 item-card position-relative">
                                    <div class="position-absolute top-0 end-0 m-2">
                                        <button class="btn btn-danger change-status-btn" data-id="${item.itemId}">
                                            <img src="/assets/logo/bin.png" alt="delete icon" style="width: 20px;">
                                        </button>
                                        <button class="btn btn-warning item-update-button" 
                                            data-id="${item.itemId}" 
                                            data-name="${item.itemName}" 
                                            data-price="${item.itemPrice}" 
                                            data-category="${item.itemCategory}" 
                                            data-description="${item.itemDescription}" 
                                            data-availability="${item.itemAvailability}" 
                                            data-image="${backendUrl}${item.itemImage}" 
                                            data-bs-toggle="modal" data-bs-target="#editItemModal">
                                            <img src="/assets/logo/compose.png" alt="edit icon" style="width: 20px;">
                                        </button>
                                    </div>
                                    <img src="${backendUrl}${item.itemImage}" class="img-fluid mb-2" 
                                         style="height: 150px; object-fit:contain;">
                                    <div class="card-body d-flex flex-column">
                                        <h5 style="overflow-y:auto; max-height:70px; height:70px; overflow:hidden;">${item.itemName}</h5>
                                        <p style="overflow-y:auto; max-height:50px; height:50px; overflow:hidden;">Item Price: <span class="fst-italic">LKR </span>${item.itemPrice}</p>
                                        <div class="item-description flex-grow-1" style="overflow-y:auto; max-height:70px;">
                                            <small class="text-secondary mt-2 mb-3">${item.itemDescription}</small>
                                        </div>
                                        <p class="status-text">Status: ${item.itemAvailability}</p>
                                        <button type="button" 
                                                class="btn ${btnClass} form-control toggle-status" 
                                                data-id="${item.itemId}">
                                            ${btnText}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        `);
                    });
                },
                error: function (xhr) {
                    console.error("Error loading business items:", xhr.responseText);
                }
            });

        } catch (err) {
            console.error("Error fetching token or items:", err);
        }
    }

    loadBusinessItems();

    // =========================
    // Image Preview Functions
    // =========================
    // function handleFilesAdd(e) {
    //     const file = e.target.files[0];
    //     if (!file) return;
    //     if (!file.type.startsWith('image/')) return alert('Upload an image only!');

    //     const reader = new FileReader();
    //     reader.onload = (event) => {
    //         $('#preview').attr('src', event.target.result).show();
    //     };
    //     reader.readAsDataURL(file);
    // }

    // function handleFilesEdit(e) {
    //     const file = e.target.files[0];
    //     if (!file) return;
    //     if (!file.type.startsWith('image/')) return alert('Upload an image only!');

    //     const reader = new FileReader();
    //     reader.onload = (event) => {
    //         $('#edit-preview').attr('src', event.target.result).show();
    //         $('#edit-preview').data('existing', null); // new image, so remove old reference
    //     };
    //     reader.readAsDataURL(file);
    // }

    // $('#drop-area').click(() => $('#fileElem').click());
    // $('#fileElem').change(handleFilesAdd);

    // $('#edit-drop-area').click(() => $('#edit-fileElem').click());
    // $('#edit-fileElem').change(handleFilesEdit);

    // =========================
    // Availability Toggle Buttons
    // =========================
    $('#availability-btn').click(() => {
        const btn = $('#availability-btn');
        const input = $('#availability-value');

        if (btn.hasClass('btn-success')) {
            btn.removeClass('btn-success').addClass('btn-danger').text('Unavailable');
            input.val('Unavailable');
        } else {
            btn.removeClass('btn-danger').addClass('btn-success').text('Available');
            input.val('Available');
        }
    });

    $('#edit-availability-btn').click(() => {
        const btn = $('#edit-availability-btn');
        const input = $('#edit-availability-value');

        if (btn.hasClass('btn-success')) {
            btn.removeClass('btn-success').addClass('btn-danger').text('Unavailable');
            input.val('Unavailable');
        } else {
            btn.removeClass('btn-danger').addClass('btn-success').text('Available');
            input.val('Available');
        }
    });

    // =========================
    // Reset Add Form
    // =========================
    $('#resetBtn').click(function (e) {
        e.preventDefault();
        Swal.fire({
            title: "Are you sure?",
            text: "This will clear all form data!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, reset it!"
        }).then((result) => {
            if (result.isConfirmed) {
                $('#add-item-form')[0].reset();
                $('#preview').hide();
                Swal.fire({ title: "Form Reset!", icon: "success", timer: 1500, showConfirmButton: false });
            }
        });
    });

    // =========================
    // Toggle Item Availability
    // =========================
    $(document).on('click', '.toggle-status', async function () {
        const btn = $(this);
        const itemId = btn.data('id');
        const token = (await cookieStore.get('token'))?.value;

        $.ajax({
            url: `${backendUrl}/api/v1/item/toggleAvailability/${itemId}`,
            method: 'PUT',
            headers: token ? { 'Authorization': 'Bearer ' + token } : {},
            success: function () {
                if (btn.hasClass('btn-success')) {
                    btn.removeClass('btn-success').addClass('btn-danger').text('Unavailable');
                    btn.closest('.card-body').find('.status-text').text('Status: Unavailable');
                } else {
                    btn.removeClass('btn-danger').addClass('btn-success').text('Available');
                    btn.closest('.card-body').find('.status-text').text('Status: Available');
                }
            },
            error: function (err) {
                console.error(err);
                alert(err.responseJSON?.message || "Error updating status!");
            }
        });
    });

    // =========================
    // Add Item
    // =========================
    $('#submitItemBtn').click(async function (e) {
        e.preventDefault();

        const inputCategory = $('#business-item-category').val();
        const validOptions = Array.from($('#categories option')).map(opt => opt.value);
        if (!validOptions.includes(inputCategory)) {
            $('#business-item-category').css('border', '2px solid red');
            if (!$('#category-error').length) {
                $('#business-item-category').after('<small id="category-error" class="text-danger">Please select a valid category from the list!</small>');
            }
            return;
        } else {
            $('#business-item-category').css('border', '1px solid #ced4da');
            $('#category-error').remove();
        }

        const token = (await cookieStore.get('token'))?.value;

        if (!$('#fileElem')[0].files.length) return alert("Please select an image!");

        let priceInput = $('#business-item-price').val().trim();
        if (!priceInput || isNaN(priceInput)) {
            alert("Please enter a valid price!");
            return;
        }
        let formattedPrice = parseFloat(priceInput).toFixed(2);


        const formData = new FormData();
        formData.append('itemName', $('#business-item-name').val());
        formData.append('itemPrice', formattedPrice);
        formData.append('itemCategory', $('#business-item-category').val());
        formData.append('itemDescription', $('#item-description').val());
        formData.append('itemAvailability', $('#availability-value').val());
        formData.append('itemStatus', 'ACTIVE');
        formData.append('itemImage', $('#fileElem')[0].files[0]);
        formData.append('businessId', businessId);

        $.ajax({
            url: backendUrl + '/api/v1/item/create',
            method: 'POST',
            headers: token ? { 'Authorization': 'Bearer ' + token } : {},
            processData: false,
            contentType: false,
            data: formData,
            success: function (res) {
                alert(res.message || 'Item added!');
                $('#Business-Item-Add-Modal').modal('hide');
                $('#add-item-form')[0].reset();
                $('#preview').hide();
                loadBusinessItems();
            },
            error: function (err) {
                console.error(err);
                alert(err.responseJSON?.message || 'Error adding item!');
            }
        });
    });

    // =========================
    // Update Item
    // =========================
    $('#editItemBtn').click(async function (e) {
        e.preventDefault();

        const itemId = $('#editbusinessId').val();
        const token = (await cookieStore.get('token'))?.value;

        if (!itemId) {
            alert("Item ID missing!");
            return;
        }

        const inputCategory = $('#edit-business-item-category').val();
        const validOptions = Array.from($('#categories option')).map(opt => opt.value);
        if (!validOptions.includes(inputCategory)) {
            $('#edit-business-item-category').css('border', '2px solid red');
            if (!$('#edit-category-error').length) {
                $('#edit-business-item-category').after('<small id="edit-category-error" class="text-danger">Please select a valid category!</small>');
            }
            return;
        } else {
            $('#edit-business-item-category').css('border', '1px solid #ced4da');
            $('#edit-category-error').remove();
        }

        let priceInput = $('#edit-business-item-price').val();
        if (!priceInput) priceInput = '0'; // default if blank
        let formattedPrice = parseFloat(priceInput).toFixed(2);

        const formData = new FormData();
        formData.append('itemId', itemId);
        formData.append('itemName', $('#edit-business-item-name').val());
        formData.append('itemPrice', formattedPrice);
        formData.append('itemCategory', $('#edit-business-item-category').val());
        formData.append('itemDescription', $('#edit-item-description').val());
        formData.append('itemAvailability', $('#edit-availability-value').val());
        formData.append('itemStatus', 'ACTIVE');

        const editFileInput = $('#edit-fileElem')[0];
        if (editFileInput.files.length > 0) {
            formData.append('itemImage', editFileInput.files[0]);
        }

        $.ajax({
            url: backendUrl + '/api/v1/item/update',
            method: 'PUT',
            headers: token ? { 'Authorization': 'Bearer ' + token } : {},
            processData: false,
            contentType: false,
            data: formData,
            success: function (res) {
                alert(res.message || 'Item updated successfully!');
                $('#editItemModal').modal('hide');
                $('#edit-item-form')[0].reset();
                $('#edit-preview').hide();
                loadBusinessItems();
            },
            error: function (err) {
                console.error(err);
                alert(err.responseJSON?.message || 'Error updating item!');
            }
        });
    });

    // =========================
    // Delete / Change Status
    // =========================
    $(document).on('click', '.change-status-btn', async function () {
        const itemId = $(this).data('id');
        const token = (await cookieStore.get('token'))?.value;

        if (!itemId) return alert("Item ID is missing!");

        Swal.fire({
            title: "Are you sure?",
            text: "This will change the status of this item!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, change it!"
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await $.ajax({
                        url: `${backendUrl}/api/v1/item/changeStatus/${itemId}`,
                        method: 'PATCH',
                        headers: token ? { 'Authorization': 'Bearer ' + token } : {},
                    });
                    Swal.fire({ title: "Status Changed!", icon: "success", timer: 1500, showConfirmButton: false });
                    loadBusinessItems();
                } catch (err) {
                    console.error("Error changing status:", err);
                    Swal.fire("Error!", err.responseJSON?.message || "Failed to change status!", "error");
                }
            }
        });
    });


    // =========================
    // Populate Edit Modal
    // =========================
    $(document).on('click', '.item-update-button', function () {
        const item = $(this).data();

        $('#editbusinessId').val(item.id);
        $('#edit-business-item-name').val(item.name);
        $('#edit-business-item-price').val(item.price);
        $('#edit-business-item-category').val(item.category);
        $('#edit-item-description').val(item.description);
        $('#edit-availability-value').val(item.availability);

        if (item.availability === 'Available') {
            $('#edit-availability-btn').removeClass('btn-danger').addClass('btn-success').text('Available');
        } else {
            $('#edit-availability-btn').removeClass('btn-success').addClass('btn-danger').text('Unavailable');
        }

        if (item.image) $('#edit-preview').attr('src', item.image).show();
        else $('#edit-preview').hide();
    });
});
