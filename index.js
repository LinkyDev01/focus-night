document.addEventListener('DOMContentLoaded', function() {
    const applyButton = document.querySelector('.apply-button');

    applyButton.addEventListener('click', function() {
        // 신청하기 버튼 클릭 시 동작
        window.location.replace("/apply.html")
    });
});
