$(document).ready(async function() {
    console.log("Business Dashboard is ready");

    const backendUrl = "http://localhost:8080"; // backend URL

    // --- Load logged-in user's businesses ---
    async function loadAllBusinesses() {
        const cookie = await cookieStore.get('token');
        const token = cookie?.value;
        const userId = sessionStorage.getItem("userId"); // get logged-in user's ID

        if (!userId) {
            alert("User ID not found. Please log in again.");
            return;
        }

        $.ajax({
            method: 'GET',
            url: backendUrl + '/api/v1/business/getAllThisUserBusinesses',
            headers: token ? { 'Authorization': 'Bearer ' + token } : {},
            data: { userId: userId },
            success: function(response) {
                const container = $('#business-list');
                container.empty();

                response.data.forEach(b => {
                    container.append(`
                        <a href="/pages/businessItemDashboard.html?businessId=${b.businessId}" 
                                class="col-md-4 mb-3" style="text-decoration:none;">

                            <div class="card">
                                <img src="${backendUrl}${b.businessLogo}" 
                                    class="img-fluid mb-2" 
                                    style="max-height:150px; object-fit:cover;">
                                <h5 class="p-2">${b.businessName}</h5>
                                <small class="text-secondary p-2" style="overflow-y:auto; max-height:80px; height:80px;">${b.businessDescription}</small>
                                <p class="p-2">${b.businessAddress}, ${b.businessAreaPostalCode}</p>
                                <p class="p-2">${b.businessEmail} | ${b.contactNumber1}</p>
                            </div>
                        </a>
                    `);
                });
            },
            error: function(xhr) {
                console.error("Error fetching user businesses:", xhr.responseText);
            }
        });
    }

    loadAllBusinesses();

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

    // Toggle Opened/Closed
    $('#now-btn').click(function () {
        if ($(this).hasClass('btn-success')) {
            $(this).removeClass('btn-success').addClass('btn-danger').text('Closed');
            $('#now-value').val('Closed');
        } else {
            $(this).removeClass('btn-danger').addClass('btn-success').text('Opened');
            $('#now-value').val('Opened');
        }
    });


    // --- Add Business ---
    $('#addBusinessButton').click(async function (e) {
        e.preventDefault();

        const cookie = await cookieStore.get('token');
        const token = cookie?.value;

        const fileInput = $('#fileElem')[0];
        if (!fileInput.files.length) {
            alert('Please upload a business logo.');
            return;
        }

        const userId = sessionStorage.getItem("userId");
        if (!userId) {
            alert("User ID not found. Please log in again.");
            return;
        }

        const formData = new FormData();
        formData.append('businessName', $('#business-name').val());
        formData.append('contactNumber1', $('#business-contact1').val());
        formData.append('contactNumber2', $('#business-contact2').val());
        formData.append('businessEmail', $('#business-email').val());
        formData.append('businessAddress', $('#business-address').val());
        formData.append('businessAreaPostalCode', $('#business-postal-code').val());
        formData.append('businessCategory', $('#Business-Place-Category').val());
        formData.append('openTime', $('#business-opening-time').val());
        formData.append('closeTime', $('#business-closing-time').val());
        formData.append('openOrClose', $('#now-value').val());
        formData.append('businessDescription', $('#business-description').val());
        formData.append('latitude', $('#latitude').val());
        formData.append('longitude', $('#longitude').val());
        formData.append('businessStatus', 'ACTIVE');
        formData.append('logo', fileInput.files[0]);
        formData.append('userId', userId);

        $.ajax({
            method: 'POST',
            url: backendUrl + '/api/v1/business/create',
            headers: token ? { 'Authorization': 'Bearer ' + token } : {},
            processData: false,
            contentType: false,
            data: formData,
            success: function(response) {
                alert(response.message || 'Business created!');
                $('#Business-add-modal').modal('hide');
                $('#add-business-form')[0].reset();
                $('#preview').hide();
                loadAllBusinesses(); // reload user businesses
            },
            error: function(xhr) {
                console.error(xhr.responseText);
                alert(xhr.responseJSON?.message || 'Error creating business!');
            }
        });
    });

    // --- Image Preview ---
    const dropArea = document.getElementById('drop-area');
    const fileInputElem = document.getElementById('fileElem');
    const preview = document.getElementById('preview');

    dropArea.addEventListener('click', () => fileInputElem.click());
    fileInputElem.addEventListener('change', handleFiles);

    function handleFiles(e) {
        const file = e.target.files[0];
        if (!file.type.startsWith('image/')) return alert('Upload an image only!');

        const reader = new FileReader();
        reader.onload = (event) => {
            preview.src = event.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }

});
