const projects = [
    {
        title: `Waizu's Mask`,
        description: 'The mask was designed and modeled in Blender and subsequently 3D printed. It features a "destroyed" design, giving the impression of being fragmented and worn, while still maintaining the average proportions of a human face.',
        link: 'Projects/Mask/mask.html',
        image: 'Projects/Mask/MaskFront.png'
    },
    {
        title: 'Red Rose',
        description: 'Unique gun model, crafted from imagination and combining elements of traditional firearm design with artistic, floral motifs. It is a semi-automatic pistol with a compact and ergonomic design, featuring intricate rose patterns that provide a striking contrast to the dark, metallic body.',
        link: 'Projects/RedRose/redRose.html',
        image: 'Projects/RedRose/redRoseThumb.png'
    },
    {
        title: 'Saber Cat',
        description: 'A saber-toothed tiger, enhanced with futuristic cybernetic implants on its paws, embodies a blend of ancient ferocity and modern technology.',
        link: 'Projects/SaberCat/saberCat.html',
        image: 'Projects/SaberCat/saberCatThumb.png'
    },
    {
        title: 'Emma',
        description: 'A model of a young, feminine hand, meticulously crafted in Blender for use in an FPS game.',
        link: 'Projects/Emma/emma.html',
        image: 'Projects/Emma/Emma.png'
    }
];

showContent('content1')
function renderProjects() {
    const projectsCarousel = document.getElementById('projects-carousel');

    projects.forEach(project => {
        const projectCard = document.createElement('a');
        projectCard.className = 'project-card';
        projectCard.href = project.link;
        projectCard.target = '_self';

        const projectImage = document.createElement('img');
        projectImage.src = project.image;
        projectImage.alt = project.title;

        const projectInfo = document.createElement('div');
        projectInfo.className = 'project-info';

        const projectTitle = document.createElement('h3');
        projectTitle.textContent = project.title;

        const projectDescription = document.createElement('p');
        projectDescription.textContent = project.description;

        projectInfo.appendChild(projectTitle);
        projectInfo.appendChild(projectDescription);

        projectCard.appendChild(projectImage);
        projectCard.appendChild(projectInfo);

        projectsCarousel.appendChild(projectCard);
    });
}

renderProjects();

function showContent(contentId) {
    var contents = document.querySelectorAll('.content');
    contents.forEach(function(content) {
        content.style.display = 'none';
    });

    var contentToShow = document.getElementById(contentId);
    contentToShow.style.display = 'block';
}

const texts = ["a Tech Artist", "a Developer", "a Freelancer"];
let count = 0;
let index = 0;
let currentText = "";
let letter = "";
let deleting = false;

(function type() {
    if (count === texts.length) {
        count = 0;
    }
    currentText = texts[count];

    if (!deleting) {
        letter = currentText.slice(0, ++index);
    } else {
        letter = currentText.slice(0, index--);
    }

    document.getElementById("typed-text").textContent = letter;

    if (!deleting && index === currentText.length) {
        setTimeout(() => {
            deleting = true;
            type();
        }, 1000);
    } else if (deleting && index === 0) {
        deleting = false;
        count++;
        setTimeout(type, 500);
    } else {
        setTimeout(type, 150);
    }

    if (!deleting && index === currentText.length) {
        document.getElementById("typed-text").style.borderRight = "2px solid transparent";
    } else {
        document.getElementById("typed-text").style.borderRight = "2px solid black";
    }
})();
