$(document).ready(async function() {
    console.log("Partner Dashboard JS loaded");

    const userId = sessionStorage.getItem("userId");

    const $vehicleCategory = $('#vehicleCategory');
    const $licenseNumber = $('#vehicleLicenseNumber');
    const $vehicleNumber = $('#vehicleNumber');
    const $vehicleImage = $('#vehicleImage');

    // Hide/Show fields based on category
    $vehicleCategory.change(function() {
        if ($vehicleCategory.val() === "Bicycle") {
            $licenseNumber.closest('.mb-3').hide();
            $vehicleNumber.closest('.mb-3').hide();
        } else {
            $licenseNumber.closest('.mb-3').show();
            $vehicleNumber.closest('.mb-3').show();
        }
    }).trigger('change'); // trigger on load

    // Drag & drop preview for vehicle image
    const $previewContainer = $('<div class="dz-preview mb-3"></div>').insertAfter($vehicleImage);
    function handleFile(file) {
        if (!file.type.startsWith("image/")) {
            alert("Please upload an image file only.");
            return;
        }
        const url = URL.createObjectURL(file);
        $previewContainer.html(`<div class="position-relative"><img src="${url}" class="img-fluid rounded"><button type="button" class="btn btn-sm btn-danger position-absolute top-0 end-0">Remove</button></div>`);

        // Remove button
        $previewContainer.find('button').click(function() {
            $vehicleImage.val("");
            $previewContainer.empty();
            URL.revokeObjectURL(url);
        });
    }

    $vehicleImage.on("change", function() {
        const file = this.files[0];
        if (file) handleFile(file);
    });

    // Drag & drop support
    $previewContainer.parent().on("dragover", function(e) {
        e.preventDefault();
        $(this).addClass("dragover");
    }).on("dragleave dragend", function(e) {
        e.preventDefault();
        $(this).removeClass("dragover");
    }).on("drop", function(e) {
        e.preventDefault();
        $(this).removeClass("dragover");
        const file = e.originalEvent.dataTransfer.files[0];
        if (file) {
            $vehicleImage[0].files = e.originalEvent.dataTransfer.files;
            handleFile(file);
        }
    });

    // Submit form
    $('#vehicleSaveForm').submit(async function(e) {
        e.preventDefault();

        const token = (await cookieStore.get('token'))?.value;
        if (!token) {
            Swal.fire({
                icon: "warning",
                title: "Not Authenticated",
                text: "User not authenticated!",
            });
            return;
        }

        if (!$vehicleImage[0].files.length) {
            Swal.fire({
                icon: "warning",
                title: "No Image",
                text: "Please upload vehicle image!",
            });
            return;
        }

        const formData = new FormData();
        const category = $vehicleCategory.val();
        formData.append('vehicleCategory', category);
        formData.append('vehicleImage', $vehicleImage[0].files[0]);
        formData.append('vehicleStatus', 'PENDING'); // or from another input
        formData.append('userId', userId);

        if (category === "Bicycle") {
            formData.append('licenseNumber', 'no');
            formData.append('vehicleNumber', 'no');
            formData.append('IDNumber', $('#idNumber').val()); // keep ID
        } else {
            formData.append('licenseNumber', $licenseNumber.val());
            formData.append('vehicleNumber', $vehicleNumber.val());
            formData.append('IDNumber', $('#idNumber').val());
        }

        $.ajax({
            url: "http://localhost:8080/api/v1/vehicle/create",
            method: "POST",
            headers: token ? { 'Authorization': 'Bearer ' + token } : {},
            processData: false,
            contentType: false,
            data: formData,
            success: function(response) {
                Swal.fire({
                    icon: "success",
                    title: "Success",
                    text: "Vehicle saved successfully!",
                });
                $('#vehicleSaveForm')[0].reset();
                $previewContainer.empty();
                $licenseNumber.closest('.mb-3').show();
                $vehicleNumber.closest('.mb-3').show();
            },
            error: function(xhr, status, error) {
                console.error("Error saving vehicle:", xhr.responseText || error);
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "Something went wrong while saving the vehicle!",
                });
            }
        });
    });
});
