interface CardProps {
  image: string
  alt: string
  title: string
  description: string
  className?: string
}

const Card = ({image, alt, title, description, className}: CardProps) => {
  return (
    <div className={`statistics__card dark:bg-zinc-800 | ${className}`}>
      <div className="img">
        <img src={image} alt={alt} />
      </div>
      <h3 className="dark:text-zinc-100">{title}</h3>
      <p className="dark:text-gray-400">{description}</p>
    </div>
  )
}

export default Card
