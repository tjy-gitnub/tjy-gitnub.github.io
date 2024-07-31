let ph;
function init() {
    ph=window.innerHeight;
    $(':root').css('--ph',`${ph}px`);
}
init();
let g_highlight=$('.highlight');
// let g_highlighta=$('.highlighta');
let g_percent=$('.shine');
// document.querySelector('#ldb').addEventListener('scroll',()=>{
//     for (let i = 0; i < g_highlighta.length; i++) {
//         const box = g_highlighta[i];
//         if($('#ldb').scrollTop()+ph-box.offsetTop>100){
//             $(box).addClass('show');
//         }else{
//             $(box).removeClass('show');
//         }
//     }
// });

let thn=false;
function tgtheme(b=true) {
    if(b)$('body').addClass('light');
    else $('body').removeClass('light');
}
if(location.search=='?light'){
    tgtheme();
}
document.addEventListener('scroll',()=>{
    let t=$('html').scrollTop();
    if(0<=t && t/ph*window.innerWidth<(window.innerWidth/2)-180){
        $('#hd').css('opacity','1');
        $('#hd').css('transform',`translateX(${t/ph*(window.innerWidth)}px)`);
    }else if(t<ph*2){
        if($('#hd').css('display')=='none'){
            $('#hd').css('display','flex');
        }
        $('#hd').css('opacity','1');
        $('#hd').css('transform',`translateX(${(window.innerWidth/2)-180}px)`);
    }else{
        if($('#hd').css('opacity')!=0){
            console.log('j')
            $('#hd').css('opacity','0');
            setTimeout(() => {
                $('#hd').css('display','none');
            }, 200);
        }
    }
    for (let i = 0; i < g_highlight.length; i++) {
        const box = $(g_highlight[i]);
        if(t+ph-box.offset().top>70){
            box.addClass('show');
        }else{
            box.removeClass('show');
        }
    }
    for (let i = 0; i < g_percent.length; i++) {
        const box = g_percent[i];
        $(box).css('--scroll',`${(ph+t-box.offsetTop)/(ph+box.offsetHeight)*100}%`);
    }
});
window.onresize=init;
$('html')[0].scroll(0,0);
