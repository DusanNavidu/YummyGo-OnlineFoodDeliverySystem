$(document).ready(async function() {
    console.log("Business Dashboard is ready");

    const backendUrl = "http://localhost:8080"; // backend URL

    // --- Load all businesses ---
    async function loadAllBusinesses() {
        const cookie = await cookieStore.get('token');
        const token = cookie?.value;

        $.ajax({
            method: 'GET',
            url: backendUrl + '/api/v1/business/getAll',
            headers: token ? { 'Authorization': 'Bearer ' + token } : {},
            success: function(response) {
                const container = $('#business-list');
                container.empty();

                response.data.forEach(b => {
                    container.append(`
                        <div class="col-md-4 mb-3">
                            <div class="card p-2">
                                <img src="${backendUrl}${b.businessLogo}" class="img-fluid mb-2" style="max-height:150px;">
                                <h5>${b.businessName}</h5>
                                <p>${b.businessDescription}</p>
                                <p>${b.businessAddress}, ${b.businessAreaPostalCode}</p>
                                <p>${b.businessEmail} | ${b.contactNumber1}</p>
                            </div>
                        </div>
                    `);
                });
            },
            error: function(xhr) {
                console.error("Error fetching businesses:", xhr.responseText);
            }
        });
    }

    loadAllBusinesses();

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

        const formData = new FormData();
        formData.append('businessName', $('#business-name').val());
        formData.append('contactNumber1', $('#business-contact1').val());
        formData.append('contactNumber2', $('#business-contact2').val());
        formData.append('businessEmail', $('#business-email').val());
        formData.append('businessAddress', $('#business-address').val());
        formData.append('businessAreaPostalCode', $('#business-postal-code').val());
        formData.append('businessCategory', $('#Business-Place-Category').val());
        formData.append('businessDescription', $('#business-description').val());
        formData.append('businessStatus', 'ACTIVE');
        formData.append('logo', fileInput.files[0]);

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
                loadAllBusinesses();
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
